/**
 * Tempo de cada slide do carrossel da home, em milissegundos: é a duração da barra que enche e da aproximação da foto
 * (retorno de 09/11/2026: a aproximação estava lenta demais e a troca demorava).
 */
export const CAROUSEL_INTERVAL_MS = 6000;

/** Índice circular: depois do último volta ao primeiro, antes do primeiro vai ao último. */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** O carrossel só gira sozinho com mais de um slide, sem pausa e sem pedido de movimento reduzido. */
export function shouldAutoplay(total: number, paused: boolean, reducedMotion: boolean): boolean {
  return total > 1 && !paused && !reducedMotion;
}
