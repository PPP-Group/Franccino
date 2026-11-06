import { addTransitionType, startTransition } from 'react';
import {
  isImageLoaded,
  markImageLoaded,
  morphType,
  sameDocumentHref,
  setPendingMorph,
  traversalMorphName,
  type MorphEdge,
} from '@/lib/ui/morph';

/*
  Controle da navegação para o movimento "abrir a peça / voltar dela" (ideia 10, retorno de 06/11/2026). Só roda no
  navegador, instalado uma vez pelo `PageTransition`:

  1. Rolagem: a posição de cada entrada do histórico é guardada aqui (`history.scrollRestoration = 'manual'`) e
     devolvida de uma vez, sem rolagem suave, no mesmo quadro em que a página volta. Assim a foto encolhe até o card
     no lugar certo, e a página não abre no topo para depois descer.
  2. Volta pelo navegador: o React trata o `popstate` de forma síncrona e sem transição. Quando a volta desfaz uma
     abertura de peça, o evento é repassado ao roteador logo depois, dentro de uma transição com o tipo do movimento.
  3. Caminho (breadcrumb) e logo: o link que leva à página de onde a peça foi aberta vira um "voltar" do navegador,
     com a rolagem e o movimento de volta.
  4. Antes da foto da página nova: nomes repetidos (que cancelariam a transição inteira) ficam num elemento só, o que
     está na tela; e as fotos da tela já baixadas terminam de decodificar (até 200 ms), para nada sair em branco.
  5. Fotos já baixadas: lista das versões que já chegaram, para a foto de destino pintar na hora (`MorphImage`).
*/

const STORE_KEY = 'franccino:navigation';
const MAX_ENTRIES = 80;

type Saved = { positions: [string, number][]; edges: [string, MorphEdge][] };

const positions = new Map<string, number>();
const edges = new Map<string, MorphEdge>();
let lastKey = '';
let lastPath = '';
let restoring = false;
let replaying = false;
let pendingEdge: MorphEdge | null = null;
let installed = false;

type NavigationLike = { currentEntry?: { key?: string } | null };

/** Chave estável da entrada atual do histórico (Navigation API), ou o endereço nos navegadores sem ela. */
function entryKey(): string {
  const navigation = (window as Window & { navigation?: NavigationLike }).navigation;
  return navigation?.currentEntry?.key ?? location.href;
}

function trim<V>(map: Map<string, V>) {
  while (map.size > MAX_ENTRIES) {
    const first = map.keys().next().value;
    if (first === undefined) break;
    map.delete(first);
  }
}

function load() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Saved;
    saved.positions?.forEach(([key, y]) => positions.set(key, y));
    saved.edges?.forEach(([key, edge]) => edges.set(key, edge));
  } catch {
    // Sem sessionStorage (aba privada, bloqueado): fica só na memória.
  }
}

function persist() {
  try {
    trim(positions);
    trim(edges);
    const saved: Saved = { positions: [...positions], edges: [...edges] };
    sessionStorage.setItem(STORE_KEY, JSON.stringify(saved));
  } catch {
    // Idem.
  }
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Rola até `top` sem animação, de novo nos quadros seguintes se a página ainda estiver crescendo. */
function scrollInstantly(top: number) {
  window.scrollTo({ top, left: 0, behavior: 'instant' });
  let tries = 0;
  const retry = () => {
    if (tries++ > 8 || Math.abs(window.scrollY - top) < 2) return;
    window.scrollTo({ top, left: 0, behavior: 'instant' });
    window.requestAnimationFrame(retry);
  };
  if (Math.abs(window.scrollY - top) >= 2) window.requestAnimationFrame(retry);
}

/**
 * Na volta, os blocos que aparecem ao rolar (RevealObserver, ideia 04) já estão à vista, sem animar: a página volta
 * como estava. `data-reveal-instant` desliga a transição deles por dois quadros (motion.css).
 */
function revealInstantly() {
  const root = document.documentElement;
  root.setAttribute('data-reveal-instant', '');
  document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((element) => {
    element.classList.add('is-revealed');
  });
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => root.removeAttribute('data-reveal-instant')),
  );
}

/** Deixa cada nome em um elemento só, o que está na tela (ou o primeiro). */
function dedupeNames() {
  const byName = new Map<string, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach((element) => {
    const name = element.style.viewTransitionName;
    if (!name || name === 'none') return;
    byName.set(name, [...(byName.get(name) ?? []), element]);
  });
  byName.forEach((elements) => {
    if (elements.length < 2) return;
    const visible = elements.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
    });
    const keep = visible ?? elements[0];
    elements.forEach((element) => {
      if (element !== keep) element.style.viewTransitionName = 'none';
    });
  });
}

/** Fotos da tela: espera chegarem do cache e decodificarem (até `DECODE_WAIT_MS`), para nada sair em branco. */
const DECODE_WAIT_MS = 200;

/** A foto já foi baixada nesta visita (alguma das versões do `srcset`, ou o `src`). */
function seenBefore(image: HTMLImageElement): boolean {
  const urls = (image.getAttribute('srcset') ?? '')
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0] ?? '')
    .concat(image.getAttribute('src') ?? '');
  return urls.some((url) => url !== '' && isImageLoaded(url));
}

function decodeVisibleImages(): Promise<unknown> {
  const pending: Promise<unknown>[] = [];
  for (const image of Array.from(document.images)) {
    if (image.complete && image.naturalWidth === 0) continue;
    const rect = image.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.width === 0) continue;
    // Só as que vêm do cache: uma foto nova da rede não segura a transição.
    if (!image.complete) {
      if (!seenBefore(image)) continue;
      // "lazy": enquanto a transição espera, o navegador não começaria a carregá-la.
      if (image.loading === 'lazy') image.loading = 'eager';
    }
    pending.push(image.decode().catch(() => undefined));
  }
  if (pending.length === 0) return Promise.resolve();
  return Promise.race([
    Promise.all(pending),
    new Promise((resolve) => window.setTimeout(resolve, DECODE_WAIT_MS)),
  ]);
}

type StartViewTransition = (options?: unknown) => ViewTransition;

/**
 * Peça em fundo branco no movimento: marca o <html> (`data-morph-fit="contain"`) para a camada da transição misturar
 * por multiplicação (motion.css) e o branco da foto não cobrir os cards vizinhos. O React tira o nome do <html>, então
 * a página por baixo é a de verdade, e só a camada inteira pode se misturar com ela.
 */
function markFit() {
  const contain = Array.from(document.querySelectorAll<HTMLElement>('[style*="view-transition-class"]')).some(
    (element) => element.style.getPropertyValue('view-transition-class').includes('morph-contain'),
  );
  if (contain) document.documentElement.dataset.morphFit = 'contain';
  else delete document.documentElement.dataset.morphFit;
}

function guardViewTransitions() {
  const doc = document as Document & { startViewTransition?: StartViewTransition };
  const original = doc.startViewTransition?.bind(document);
  if (!original) return;
  doc.startViewTransition = (options?: unknown) => {
    dedupeNames();
    let transition: ViewTransition;
    const withUpdate =
      options && typeof options === 'object' ? (options as { update?: () => unknown }) : null;
    const update = withUpdate?.update;
    if (withUpdate && typeof update === 'function') {
      transition = original({
        ...withUpdate,
        update: async () => {
          const result = await update();
          dedupeNames();
          markFit();
          await decodeVisibleImages();
          return result;
        },
      });
    } else {
      transition = original(options);
    }
    void transition.finished.finally(() => {
      delete document.documentElement.dataset.morphFit;
    });
    return transition;
  };
}

function onScroll() {
  if (!restoring) positions.set(entryKey(), window.scrollY);
}

function onClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const link = (event.target as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) return;
  if (link.target && link.target !== '_self') return;
  const url = new URL(link.href);
  if (url.origin !== location.origin) return;
  positions.set(entryKey(), window.scrollY);

  // Caminho ou logo que leva à página de onde a peça foi aberta: é um "voltar".
  const incoming = edges.get(entryKey());
  if (incoming && !url.hash && sameDocumentHref(url.href, incoming.fromHref)) {
    event.preventDefault();
    event.stopPropagation();
    history.back();
    return;
  }

  const name = link.getAttribute('data-morph-link');
  if (name && !sameDocumentHref(url.href, location.href)) {
    const source =
      link.querySelector('img') ??
      document.querySelector<HTMLImageElement>(`a[data-morph-link="${CSS.escape(name)}"] img`);
    setPendingMorph({ name, path: url.pathname, src: source?.currentSrc || null });
    pendingEdge = { from: entryKey(), fromHref: location.href, name };
  } else {
    setPendingMorph(null);
    pendingEdge = null;
  }
}

function onPopState(event: PopStateEvent) {
  if (replaying) return;
  const toKey = entryKey();
  const name = traversalMorphName(edges, lastKey, toKey);
  if (location.pathname === lastPath) {
    // Só mudou a busca ou o `#`: a página fica, a rolagem volta já.
    lastKey = toKey;
    const top = positions.get(toKey);
    if (top !== undefined) window.requestAnimationFrame(() => scrollInstantly(top));
    return;
  }
  restoring = true;
  const visualTransition = (event as PopStateEvent & { hasUAVisualTransition?: boolean })
    .hasUAVisualTransition;
  if (!name || visualTransition || reducedMotion()) {
    setPendingMorph(null);
    return;
  }
  // Fora do evento, o roteador do Next faz a volta numa transição comum, que o React anima.
  event.stopImmediatePropagation();
  setPendingMorph({ name, path: location.pathname, src: null });
  const state: unknown = event.state;
  window.setTimeout(() => {
    replaying = true;
    try {
      startTransition(() => {
        addTransitionType(morphType(name));
        window.dispatchEvent(new PopStateEvent('popstate', { state }));
      });
    } finally {
      replaying = false;
    }
  }, 0);
}

function onImageLoad(event: Event) {
  if (event.target instanceof HTMLImageElement) markImageLoaded(event.target.currentSrc);
}

/** Instala os ouvintes uma vez (o layout do idioma não desmonta na navegação). */
export function installNavigationMotion(): void {
  if (installed) return;
  installed = true;
  load();
  history.scrollRestoration = 'manual';
  lastKey = entryKey();
  lastPath = location.pathname;
  document.querySelectorAll('img').forEach((image) => {
    if (image.complete && image.naturalWidth > 0) markImageLoaded(image.currentSrc);
  });
  document.addEventListener('load', onImageLoad, true);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('click', onClick, true);
  window.addEventListener('popstate', onPopState, true);
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
  guardViewTransitions();

  // Recarregar ou voltar de outro site: a posição guardada desta entrada.
  const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const top = positions.get(lastKey);
  if (top !== undefined && (navigationEntry?.type === 'reload' || navigationEntry?.type === 'back_forward')) {
    scrollInstantly(top);
  }
}

/**
 * Chamado no mesmo quadro em que a página nova entra (efeito de layout no `PageTransition`), antes da foto do
 * movimento: devolve a rolagem da entrada (na volta) ou registra de onde a peça foi aberta (no clique).
 */
export function onRouteCommit(): void {
  const key = entryKey();
  if (restoring) {
    revealInstantly();
    scrollInstantly(positions.get(key) ?? 0);
    restoring = false;
  } else if (pendingEdge) {
    edges.set(key, pendingEdge);
  } else {
    edges.delete(key);
  }
  pendingEdge = null;
  setPendingMorph(null);
  lastKey = key;
  lastPath = location.pathname;
}
