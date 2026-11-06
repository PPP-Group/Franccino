/**
 * Posição da prévia de fotos da tabela técnica (`RowPeek`). Lógica pura, sem DOM, para testar: a caixa fica ao lado
 * do ponteiro, nunca por cima dele, e dentro da janela.
 */

/** Caixa da prévia (px): três fotos de 4:3 espalhadas cabem nela com a rotação. */
export const PEEK_BOX = { width: 240, height: 190, photo: 180 } as const;

/** Distância entre o ponteiro e a prévia, e a folga até a borda da janela. */
const GAP = 28;
const EDGE = 16;

export function peekPosition(
  pointerX: number,
  pointerY: number,
  viewportWidth: number,
  viewportHeight: number,
  box: { width: number; height: number } = PEEK_BOX,
): { x: number; y: number } {
  // À direita do ponteiro; sem espaço, à esquerda. Assim a caixa nunca cobre a seta.
  const right = pointerX + GAP;
  const x = right + box.width <= viewportWidth - EDGE ? right : pointerX - GAP - box.width;
  // Centrada na altura do ponteiro, presa dentro da janela.
  const y = Math.min(Math.max(pointerY - box.height / 2, EDGE), viewportHeight - box.height - EDGE);
  return { x: Math.max(x, EDGE), y };
}
