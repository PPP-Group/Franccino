/** Tamanho final do quadradinho que entra no ícone da lista, em px. */
const LANDING_SIZE = 14;
const FLY_MS = 760;
/** Tempo do cabeçalho voltar à tela (motion.css, `--t-mid`), com folga para o quadro do fim. */
const HEADER_REVEAL_MS = 340;

type Box = { left: number; top: number; width: number; height: number };

/**
 * Caminho da foto até o ícone da lista: o quadrado (o menor lado da foto) sai do centro da foto, sobe um pouco num arco
 * e encolhe até `LANDING_SIZE` no centro do ícone.
 */
export function flyPath(from: Box, to: Box) {
  const size = Math.max(1, Math.min(from.width, from.height));
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const dx = to.left + to.width / 2 - startX;
  const dy = to.top + to.height / 2 - startY;
  return {
    size,
    left: startX - size / 2,
    top: startY - size / 2,
    dx,
    dy,
    endScale: LANDING_SIZE / size,
  };
}

/** Tamanho do quadradinho quando o voo sai do botão (a foto saiu da tela), em px. */
const ORIGIN_SIZE = 72;

/** Metade ou mais da foto à vista. */
export function mostlyVisible(box: Box, viewport = window.innerHeight): boolean {
  const visible = Math.min(box.top + box.height, viewport) - Math.max(box.top, 0);
  return visible >= box.height / 2;
}

/** Quadrado de `ORIGIN_SIZE` centrado em cima do botão. */
export function originBox(button: Box): Box {
  return {
    left: button.left + button.width / 2 - ORIGIN_SIZE / 2,
    top: button.top - ORIGIN_SIZE,
    width: ORIGIN_SIZE,
    height: ORIGIN_SIZE,
  };
}

/**
 * Cabeçalho escondido pela rolagem (`data-header-hide`, BootScript): volta à tela para o voo ter onde pousar (retorno de
 * 16/11/2026). Devolve quanto esperar até ele chegar; ele só some de novo na próxima rolagem para baixo.
 */
export function revealHeader(root: HTMLElement = document.documentElement): number {
  if (!root.hasAttribute('data-header-hide')) return 0;
  root.removeAttribute('data-header-hide');
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : HEADER_REVEAL_MS;
}

/**
 * Peça adicionada à lista de orçamento (retorno de 09/11/2026): a foto vira um quadradinho que encolhe e voa até o
 * ícone da lista no cabeçalho (`[data-quote-target]`); o ícone pulsa quando ele chega (`data-quote-incoming` atrasa o
 * pulso do contador até o pouso, motion.css). Com o cabeçalho escondido, ele volta antes e o voo sai quando ele chega.
 * Sem a foto, sem o ícone, ou com movimento reduzido, não faz nada.
 */
export function flyToQuote(source: HTMLImageElement | null | undefined, origin?: Element | null): void {
  if (!source || typeof window === 'undefined' || typeof source.animate !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector<HTMLElement>('[data-quote-target]');
  if (!target) return;
  const photo = source.getBoundingClientRect();
  if (photo.width === 0) return;
  // Foto fora da tela (na página da peça, rolada até o botão): o quadradinho sai de cima do botão (16/11/2026).
  const from = origin && !mostlyVisible(photo) ? originBox(origin.getBoundingClientRect()) : photo;
  const wait = revealHeader();
  // O ícone é procurado de novo depois da espera: o contador da lista o desenha outra vez quando a peça entra.
  if (wait > 0)
    window.setTimeout(() => fly(source, document.querySelector('[data-quote-target]') ?? target, from), wait);
  else fly(source, target, from);
}

function fly(source: HTMLImageElement, target: HTMLElement, from: Box): void {
  const to = target.getBoundingClientRect();
  if (to.width === 0 || to.bottom < 0 || to.top > window.innerHeight) return;

  const path = flyPath(from, to);
  const ghost = document.createElement('div');
  ghost.className = 'quote-fly';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.style.left = `${path.left}px`;
  ghost.style.top = `${path.top}px`;
  ghost.style.width = `${path.size}px`;
  ghost.style.height = `${path.size}px`;
  ghost.style.backgroundImage = `url("${(source.currentSrc || source.src).replace(/"/g, '%22')}")`;
  document.body.append(ghost);

  const link = target.closest('a') ?? target;
  link.setAttribute('data-quote-incoming', '');
  const lift = Math.min(120, Math.abs(path.dy) * 0.25 + 40);
  const animation = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: `translate(${path.dx * 0.45}px, ${path.dy * 0.45 - lift}px) scale(${Math.max(path.endScale, 0.35)})`,
        opacity: 1,
        offset: 0.45,
      },
      { transform: `translate(${path.dx}px, ${path.dy}px) scale(${path.endScale})`, opacity: 0.85 },
    ],
    { duration: FLY_MS, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' },
  );
  const done = () => {
    ghost.remove();
    // O pulso do contador ainda está tocando: a marca sai depois dele, para o atraso não mudar no meio.
    window.setTimeout(() => link.removeAttribute('data-quote-incoming'), 900);
  };
  animation.finished.then(done, done);
}
