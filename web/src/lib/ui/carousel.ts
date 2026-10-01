/** Intervalo entre os slides do carrossel da home, em milissegundos. */
export const CAROUSEL_INTERVAL_MS = 7000;

/** Índice circular: depois do último volta ao primeiro, antes do primeiro vai ao último. */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** O carrossel só gira sozinho com mais de um slide, sem pausa e sem pedido de movimento reduzido. */
export function shouldAutoplay(total: number, paused: boolean, reducedMotion: boolean): boolean {
  return total > 1 && !paused && !reducedMotion;
}
