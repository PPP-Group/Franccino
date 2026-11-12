/**
 * Regras puras do carrossel com a peça em destaque (banco de ideias, ideia 01; `FeatureCarousel`). O componente só
 * mede o DOM e chama estas funções.
 *
 * O carrossel é um "coverflow" empilhado: todas as peças ficam no mesmo palco, a do centro grande e na frente, e as
 * vizinhas encostadas nela, cada vez menores e mais apagadas quanto mais longe do centro. A posição de cada peça sai da
 * distância (em peças, fracionária durante o arrasto) até o centro: `coverflowPose`.
 */

/**
 * O carrossel serve a partir de 2 peças. Com mais de 24 (coleção ou designer grande), ele mostra as 24 primeiras e a
 * grade embaixo traz todas (retorno de 09/11/2026: a Tempo, com 15 peças, ficava sem carrossel).
 */
export const FEATURE_CAROUSEL_MIN = 2;
export const FEATURE_CAROUSEL_MAX = 24;

/** Distância, em px, que o ponteiro anda antes de virar arrasto (abaixo disso é clique). */
export const DRAG_THRESHOLD_PX = 6;

/** Velocidade (px/ms) a partir da qual soltar o arrasto leva à peça seguinte, mesmo sem passar da metade. */
export const FLICK_VELOCITY = 0.45;

/** Quanto do arrasto vale além da primeira e da última peça (a faixa resiste, como uma mola). */
export const EDGE_RESISTANCE = 0.3;

/** Rolagem lateral (trackpad, roda inclinada), em px, para andar uma peça. */
export const WHEEL_STEP_PX = 60;

/**
 * Pose de cada degrau a partir do centro (0 = peça do centro, 1 = vizinha, 2 = a seguinte...). `x` é a distância ao
 * centro em larguras da peça do centro, `scale` o tamanho e `fade` o quanto um véu da cor do fundo cobre a peça (0
 * nítida, 1 toda coberta). A peça nunca fica transparente (retorno de 07/11/2026: com transparência, uma peça aparecia
 * dentro da outra): `opacity` só some com a das pontas, já coberta pelo véu.
 *
 * Revisão da Franccino (12/11/2026: "embaraçado, necessário maior espaçamento"): as vizinhas deixaram de passar por
 * trás da peça do centro. Cada uma fica a mais de uma largura de distância, e a queda de tamanho é mais suave; na tela
 * de um notebook ficam cinco peças à vista (a do centro e duas de cada lado).
 */
const STEP_X = [0, 1.02, 1.78, 2.4, 2.9];
const STEP_SCALE = [1, 0.56, 0.42, 0.33, 0.26];
const STEP_FADE = [0, 0.3, 0.55, 0.78, 1];
const STEP_OPACITY = [1, 1, 1, 1, 0];

/** Peças à vista de cada lado do centro; a partir daí a peça fica invisível e fora do alcance do ponteiro. */
export const VISIBLE_PER_SIDE = 3;

export type CoverflowPose = {
  /** Deslocamento horizontal em larguras da peça do centro (negativo = à esquerda). */
  x: number;
  scale: number;
  /** Véu da cor do fundo por cima da peça: 0 (foto nítida) a 1 (toda coberta). */
  fade: number;
  opacity: number;
  /** Ordem de empilhamento: a do centro na frente. */
  z: number;
  /** Longe demais do centro: invisível e sem clique. */
  hidden: boolean;
};

function lerpTable(table: readonly number[], distance: number): number {
  const last = table.length - 1;
  if (distance >= last) return table[last];
  const step = Math.floor(distance);
  const fraction = distance - step;
  return table[step] + (table[step + 1] - table[step]) * fraction;
}

/** Pose da peça que está a `offset` peças do centro (fracionário durante o arrasto). */
export function coverflowPose(offset: number): CoverflowPose {
  const distance = Math.abs(offset);
  const side = offset < 0 ? -1 : 1;
  const opacity = lerpTable(STEP_OPACITY, distance);
  return {
    x: side * lerpTable(STEP_X, distance),
    scale: lerpTable(STEP_SCALE, distance),
    fade: lerpTable(STEP_FADE, distance),
    opacity,
    z: 100 - Math.round(distance * 10),
    hidden: opacity <= 0.01,
  };
}

/**
 * Posição (em peças, fracionária) durante o arrasto. `dx` é o quanto o ponteiro andou (positivo = para a direita, que
 * volta uma peça) e `stepPx` quantos px valem uma peça. Além das pontas o arrasto resiste.
 */
export function dragPosition(start: number, dx: number, stepPx: number, total: number): number {
  if (total <= 0 || stepPx <= 0) return 0;
  const raw = start - dx / stepPx;
  const last = total - 1;
  if (raw < 0) return raw * EDGE_RESISTANCE;
  if (raw > last) return last + (raw - last) * EDGE_RESISTANCE;
  return raw;
}

export function fitsFeatureCarousel(total: number): boolean {
  return total >= FEATURE_CAROUSEL_MIN;
}

/** As peças que entram no carrossel: todas, até o limite. */
export function carouselPieces<T>(items: readonly T[]): T[] {
  return items.slice(0, FEATURE_CAROUSEL_MAX);
}

export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

/** Abre com vizinhas dos dois lados: a terceira peça com 5 ou mais, a segunda com 3 ou 4, a primeira com 2. */
export function initialIndex(total: number): number {
  return Math.max(0, Math.min(2, Math.floor((total - 1) / 2)));
}

/** Índice do centro mais perto do centro visível da faixa. */
export function nearestIndex(centers: readonly number[], viewCenter: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  centers.forEach((center, index) => {
    const distance = Math.abs(center - viewCenter);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/**
 * Peça em que o arrasto termina. `velocity` é em px/ms no sentido do avanço (positivo = avança). Um arrasto rápido
 * que não chegou a trocar de peça leva à vizinha no sentido do gesto.
 */
export function releaseIndex(nearest: number, startIndex: number, velocity: number, total: number): number {
  if (nearest === startIndex && Math.abs(velocity) >= FLICK_VELOCITY) {
    return clampIndex(startIndex + Math.sign(velocity), total);
  }
  return clampIndex(nearest, total);
}

/** Teclas do carrossel: setas andam uma peça, Home e End vão às pontas. `null` para as outras teclas. */
export function keyTarget(key: string, active: number, total: number): number | null {
  switch (key) {
    case 'ArrowLeft':
      return clampIndex(active - 1, total);
    case 'ArrowRight':
      return clampIndex(active + 1, total);
    case 'Home':
      return 0;
    case 'End':
      return clampIndex(total - 1, total);
    default:
      return null;
  }
}

/**
 * Rolagem lateral acumulada: devolve quantas peças andar (-1, 0 ou 1) e o que sobra no acumulador. Uma peça por vez,
 * para o trackpad não atravessar o carrossel inteiro num gesto.
 */
export function wheelStep(accumulated: number): { step: -1 | 0 | 1; rest: number } {
  if (accumulated >= WHEEL_STEP_PX) return { step: 1, rest: 0 };
  if (accumulated <= -WHEEL_STEP_PX) return { step: -1, rest: 0 };
  return { step: 0, rest: accumulated };
}

/** Número com dois algarismos para o contador ("02 / 12"). */
export function counterNumber(value: number): string {
  return String(value).padStart(2, '0');
}

/** Largura máxima e altura máxima de uma peça, em larguras da peça do centro (`--fc-item`). */
const MAX_WIDE = 1.55;
const MAX_TALL = 1.12;

/**
 * Largura da foto no quadro da peça, em larguras de `--fc-item` (revisão da Franccino, 12/11/2026: um sofá largo no
 * centro parecia menor que a cadeira ao lado). Todas as peças ocupam mais ou menos a mesma área: a foto larga cresce na
 * largura (raiz da proporção) e a alta cresce um pouco na altura, com limites para nada sair do palco. Sem medida, 1.
 */
export function pieceWidthFactor(
  width: number | null | undefined,
  height: number | null | undefined,
): number {
  if (!width || !height || width <= 0 || height <= 0) return 1;
  const ratio = width / height;
  if (ratio >= 1) return Math.min(MAX_WIDE, Math.sqrt(ratio));
  return ratio * Math.min(MAX_TALL, 1 / Math.sqrt(ratio));
}
