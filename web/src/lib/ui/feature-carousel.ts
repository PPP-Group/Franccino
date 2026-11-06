/**
 * Regras puras do carrossel com a peça em destaque (banco de ideias, ideia 01; `FeatureCarousel`). O componente só
 * mede o DOM e chama estas funções.
 */

/** O carrossel serve de 2 a 12 peças; fora disso a página fica com a grade (coleção e designer). */
export const FEATURE_CAROUSEL_MIN = 2;
export const FEATURE_CAROUSEL_MAX = 12;

/** Distância, em px, que o mouse anda antes de virar arrasto (abaixo disso é clique). */
export const DRAG_THRESHOLD_PX = 6;

/** Velocidade (px/ms) a partir da qual soltar o arrasto leva à peça seguinte, mesmo sem passar da metade. */
export const FLICK_VELOCITY = 0.45;

export function fitsFeatureCarousel(total: number): boolean {
  return total >= FEATURE_CAROUSEL_MIN && total <= FEATURE_CAROUSEL_MAX;
}

export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

/** Com 3 peças ou mais, abre na segunda: a peça em destaque fica com uma vizinha de cada lado. */
export function initialIndex(total: number): number {
  return total >= 3 ? 1 : 0;
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
 * Peça em que o arrasto termina. `velocity` é em px/ms no sentido da rolagem (positivo = avança). Um arrasto rápido
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

/** Número com dois algarismos para o contador ("02 / 12"). */
export function counterNumber(value: number): string {
  return String(value).padStart(2, '0');
}
