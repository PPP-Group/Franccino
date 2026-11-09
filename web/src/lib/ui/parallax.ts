/**
 * Posição de um bloco na passagem pela tela, de -1 (o topo dele acabou de aparecer embaixo) a 1 (o fim dele acabou
 * de sair por cima); 0 com o bloco centrado. Fora da passagem, fica no limite.
 */
export function parallaxShift(top: number, height: number, viewport: number): number {
  const travel = viewport + height;
  if (travel <= 0) {
    return 0;
  }
  const progress = Math.min(1, Math.max(0, (viewport - top) / travel));
  return progress * 2 - 1;
}
