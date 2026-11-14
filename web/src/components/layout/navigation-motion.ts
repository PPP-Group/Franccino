import { addTransitionType, startTransition } from 'react';
import { flushSync } from 'react-dom';
import {
  isImageLoaded,
  markImageLoaded,
  morphType,
  sameDocumentHref,
  setActiveMorph,
  setPendingMorph,
  traversalMorphName,
  type HeroAdoption,
  type LeadProduct,
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
  3. Caminho (breadcrumb): o link que leva à página de onde a peça foi aberta vira um "voltar" do navegador, com a
     rolagem e o movimento de volta. A logo não (`data-no-motion`): recarrega a home no topo (retorno de 09/11/2026).
  4. Antes da foto da página nova: nomes repetidos (que cancelariam a transição inteira) ficam num elemento só, o que
     está na tela; e as fotos da tela já baixadas terminam de decodificar (até 200 ms), para nada sair em branco.
  5. Fotos já baixadas: lista das versões que já chegaram, para a foto de destino pintar na hora (`MorphImage`).
*/

const STORE_KEY = 'franccino:navigation';
const MAX_ENTRIES = 80;

type Saved = {
  positions: [string, number][];
  edges: [string, MorphEdge][];
  heroes?: [string, HeroAdoption][];
  leads?: [string, LeadProduct][];
};

const positions = new Map<string, number>();
const edges = new Map<string, MorphEdge>();
/** Nome que a foto do topo de cada entrada adotou (a origem que a abriu), para a volta encontrar o par. */
const heroes = new Map<string, HeroAdoption>();
/** Peça que entrou em primeiro na listagem de cada entrada (aberta a partir da página dela). */
const leads = new Map<string, LeadProduct>();
let pendingHero: HeroAdoption | null = null;
let pendingLead: LeadProduct | null = null;
let lastKey = '';
let lastPath = '';
let restoring = false;
let replaying = false;
let pendingEdge: MorphEdge | null = null;
let installed = false;
/** Rolagem presa entre o clique num link e a troca de página (ver `pinScroll`). */
let pinned: { y: number; until: number } | null = null;
const PIN_MS = 8000;

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
    saved.heroes?.forEach(([key, hero]) => heroes.set(key, hero));
    saved.leads?.forEach(([key, lead]) => leads.set(key, lead));
  } catch {
    // Sem sessionStorage (aba privada, bloqueado): fica só na memória.
  }
}

function persist() {
  try {
    trim(positions);
    trim(edges);
    trim(heroes);
    trim(leads);
    const saved: Saved = {
      positions: [...positions],
      edges: [...edges],
      heroes: [...heroes],
      leads: [...leads],
    };
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

/**
 * Foto de destino do movimento (a que tem a classe `morph-*`): espera ela chegar e decodificar, até `MORPH_WAIT_MS`,
 * mesmo que venha da rede. Sem isso a camada nova do movimento saía em branco (a página da peça aberta pelo carrossel
 * pela primeira vez) e a foto só aparecia no fim, com um fade (retorno de 13/11/2026). A página antiga fica parada na
 * tela enquanto espera.
 */
const MORPH_WAIT_MS = 800;

function morphTargetImages(): HTMLImageElement[] {
  const images: HTMLImageElement[] = [];
  document.querySelectorAll<HTMLElement>('[style*="view-transition-class"]').forEach((element) => {
    if (!/morph-/.test(element.style.getPropertyValue('view-transition-class'))) return;
    const image = element instanceof HTMLImageElement ? element : element.querySelector('img');
    if (image) images.push(image);
  });
  return images;
}

function waitForMorphTargets(): Promise<unknown> {
  const pending = morphTargetImages().map((image) => {
    if (image.loading === 'lazy') image.loading = 'eager';
    // A foto do movimento entra pronta, sem o fade de quem chega da rede (motion.css, 12g): é o movimento que a traz.
    const settle = () => {
      if (image.naturalWidth > 0) image.setAttribute('data-loaded', 'instant');
      return image.decode().catch(() => undefined);
    };
    if (image.complete) return settle();
    return new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    }).then(settle);
  });
  if (pending.length === 0) return Promise.resolve();
  return Promise.race([
    Promise.all(pending),
    new Promise((resolve) => window.setTimeout(resolve, MORPH_WAIT_MS)),
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
    (element) => /morph-(contain|cutout)/.test(element.style.getPropertyValue('view-transition-class')),
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
          await Promise.all([decodeVisibleImages(), waitForMorphTargets()]);
          return result;
        },
      });
    } else {
      transition = original(options);
    }
    void transition.finished.finally(() => {
      delete document.documentElement.dataset.morphFit;
      setActiveMorph(null);
    });
    return transition;
  };
}

/*
  Entre o clique e a página nova, a página de origem não rola. Quando a resposta do servidor chega, o navegador devolve
  o foco ao link clicado e rola até a barra de filtros (fixa) ou o leva para outro lugar; o card clicado saía da tela e
  o React desiste do movimento quando a foto de origem não está à vista: a peça abria sem animar na primeira vez e
  animava nas seguintes, com a página já no cache (retorno de 13/11/2026). A rolagem da própria pessoa solta a trava.
*/
function pinScroll() {
  pinned = { y: window.scrollY, until: Date.now() + PIN_MS };
}

function unpinScroll() {
  pinned = null;
}

function onScroll() {
  if (pinned) {
    if (Date.now() > pinned.until) {
      pinned = null;
    } else if (Math.abs(window.scrollY - pinned.y) > 1) {
      window.scrollTo({ top: pinned.y, left: 0, behavior: 'instant' });
      return;
    }
  }
  if (!restoring) positions.set(entryKey(), window.scrollY);
}

/**
 * Marca o par da navegação que começa: a foto de origem passa a ter a classe do movimento já agora, antes da troca de
 * página (`morphShare`). `flushSync`: a origem precisa estar marcada antes do commit da navegação.
 */
function activate(name: string | null) {
  try {
    flushSync(() => setActiveMorph(name));
  } catch {
    setActiveMorph(name);
  }
}

/* ---------- peça que vai em primeiro na listagem (retorno de 13/11/2026) ---------- */

/** A página da peça aberta: a peça e os endereços das listagens que a contêm (categoria, área, coleção, designer...). */
export type LeadSource = { card: LeadProduct['card']; morph: string; paths: string[] };

let leadSource: LeadSource | null = null;
let heroName: { path: string; name: string } | null = null;
let navigateWithTypes: ((href: string, types: string[]) => void) | null = null;

/** A página da peça avisa que está aberta (e some ao sair). */
export function setLeadSource(source: LeadSource | null): void {
  leadSource = source;
}

/** A foto do topo avisa o nome que está usando (a da peça pode ter vindo do carrossel ou de um ponto clicável). */
export function setHeroName(path: string, name: string | null): void {
  heroName = name ? { path, name } : null;
}

/** O `PageTransition` entrega a navegação do Next com os tipos da transição. */
export function setNavigator(navigate: ((href: string, types: string[]) => void) | null): void {
  navigateWithTypes = navigate;
}

function samePath(a: string, b: string): boolean {
  return a.replace(/\/$/, '') === b.replace(/\/$/, '');
}

/**
 * Link da página da peça para uma listagem que a contém (caminho, menu, rodapé): a navegação vira o movimento da foto
 * da peça até o primeiro lugar da lista, que ela ocupa nesse momento.
 */
function leadNavigation(url: URL): boolean {
  const source = leadSource;
  if (!source || !navigateWithTypes || url.hash || reducedMotion()) return false;
  if (!source.paths.some((path) => samePath(path, url.pathname))) return false;
  const name = heroName && samePath(heroName.path, location.pathname) ? heroName.name : source.morph;
  const stage = document.querySelector<HTMLImageElement>('.gallery__stage img');
  const lead: LeadProduct = { card: source.card, morph: name };
  document.documentElement.setAttribute('data-reveal-instant', '');
  setPendingMorph({ name, path: url.pathname, src: stage?.currentSrc || null, hero: null, lead });
  pendingEdge = { from: entryKey(), fromHref: location.href, name };
  pendingHero = null;
  pendingLead = lead;
  activate(name);
  navigateWithTypes(url.pathname + url.search, [morphType(name)]);
  return true;
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
  // A logo recarrega a home no topo: nada de "voltar" nem de movimento (retorno de 09/11/2026).
  if (link.hasAttribute('data-no-motion')) {
    setPendingMorph(null);
    pendingEdge = null;
    pendingHero = null;
    pendingLead = null;
    return;
  }
  positions.set(entryKey(), window.scrollY);
  if (!sameDocumentHref(url.href, location.href)) pinScroll();

  // Caminho ou logo que leva à página de onde a peça foi aberta: é um "voltar".
  const incoming = edges.get(entryKey());
  if (incoming && !url.hash && sameDocumentHref(url.href, incoming.fromHref)) {
    event.preventDefault();
    event.stopPropagation();
    history.back();
    return;
  }

  const name = link.getAttribute('data-morph-link');
  if (!name && !sameDocumentHref(url.href, location.href) && leadNavigation(url)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (name && !sameDocumentHref(url.href, location.href)) {
    const source =
      link.querySelector('img') ??
      document.querySelector<HTMLImageElement>(`a[data-morph-link="${CSS.escape(name)}"] img`);
    const attr = link.getAttribute('data-morph-fit');
    const fit = attr === 'cutout' || attr === 'contain' || attr === 'cover' ? attr : undefined;
    pendingHero = { name, fit };
    pendingLead = null;
    activate(name);
    setPendingMorph({ name, path: url.pathname, src: source?.currentSrc || null, fit, hero: pendingHero });
    pendingEdge = { from: entryKey(), fromHref: location.href, name };
  } else {
    setPendingMorph(null);
    setActiveMorph(null);
    pendingEdge = null;
    pendingHero = null;
    pendingLead = null;
  }
}

function onPopState(event: PopStateEvent) {
  if (replaying) return;
  unpinScroll();
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
  // A página de volta já entra com os blocos à vista (motion.css), antes da foto do movimento ser fotografada: sem
  // isso a faixa pousava 20 px abaixo, invisível, e pulava depois (retorno de 07/11/2026).
  document.documentElement.setAttribute('data-reveal-instant', '');
  const visualTransition = (event as PopStateEvent & { hasUAVisualTransition?: boolean })
    .hasUAVisualTransition;
  // A foto do topo da página de volta retoma o nome que tinha, e a lista volta com a mesma peça em primeiro: a volta
  // seguinte ainda encontra o par.
  const hero = heroes.get(toKey) ?? null;
  const lead = leads.get(toKey) ?? null;
  if (!name || visualTransition || reducedMotion()) {
    setActiveMorph(null);
    setPendingMorph({ name: null, path: location.pathname, src: null, hero, lead });
    return;
  }
  // Fora do evento, o roteador do Next faz a volta numa transição comum, que o React anima.
  event.stopImmediatePropagation();
  // O 3D aberto na página da peça dá lugar à foto, para ela encolher até o card (motion.css).
  document.documentElement.setAttribute('data-morph-leaving', '');
  setPendingMorph({ name, path: location.pathname, src: null, hero, lead });
  activate(name);
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
  // A pessoa rolou de propósito: a trava sai.
  for (const type of ['wheel', 'touchmove', 'keydown'] as const) {
    window.addEventListener(type, unpinScroll, { passive: true, capture: true });
  }
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
  unpinScroll();
  onMorphSettled();
  const key = entryKey();
  if (restoring) {
    revealInstantly();
    scrollInstantly(positions.get(key) ?? 0);
    restoring = false;
  } else {
    if (pendingEdge) edges.set(key, pendingEdge);
    else edges.delete(key);
    if (pendingHero) heroes.set(key, pendingHero);
    else heroes.delete(key);
    if (pendingLead) {
      leads.set(key, pendingLead);
      revealInstantly();
      scrollToLead();
    } else {
      leads.delete(key);
    }
  }
  pendingEdge = null;
  pendingHero = null;
  pendingLead = null;
  setPendingMorph(null);
  lastKey = key;
  lastPath = location.pathname;
  // Sem movimento (nenhum par na tela), a marca do par sai logo depois da troca.
  window.setTimeout(() => {
    let running = false;
    try {
      running = document.documentElement.matches(':active-view-transition');
    } catch {
      // Navegador sem o seletor: a transição já terminou há tempo.
    }
    if (!running) setActiveMorph(null);
  }, 1500);
}

/** A lista aberta pela peça rola até a grade, onde a peça ocupa o primeiro lugar (a foto encolhe até ali). */
function scrollToLead() {
  const lead = document.querySelector<HTMLElement>('.plate--lead');
  if (!lead) return;
  const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
  const rect = lead.getBoundingClientRect();
  if (rect.top >= header && rect.bottom <= window.innerHeight) return;
  scrollInstantly(Math.max(0, window.scrollY + rect.top - header - 24));
}

/** A página de volta já entrou: a marca que trocava o 3D pela foto sai. */
function onMorphSettled(): void {
  document.documentElement.removeAttribute('data-morph-leaving');
}
