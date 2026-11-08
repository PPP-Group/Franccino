/**
 * Posição da prévia de fotos da tabela técnica (`RowPeek`). Lógica pura, sem DOM, para testar: a caixa fica ao lado
 * do ponteiro, nunca por cima dele, e dentro da janela.
 *
 * As fotos saem empilhadas e se abrem lado a lado, como cartas que se separam (retorno de 07/11/2026: "ficam uma atrás
 * da outra, não vejo"): a caixa tem a largura das fotos abertas, com um respiro entre elas.
 */

/** Uma foto da prévia (px, 4:3) e o passo entre uma foto e a seguinte quando abertas (a largura e o respiro). */
export const PEEK_PHOTO = { width: 168, height: 126, step: 180 } as const;

/** Folga em volta das fotos, para a leve rotação de cada uma não ser cortada. */
const PAD = 12;

/** Caixa da prévia aberta, para `count` fotos (de 1 a `PREVIEW_COUNT`). */
export function peekBox(count: number): { width: number; height: number } {
  const photos = Math.max(1, count);
  return {
    width: PEEK_PHOTO.width + (photos - 1) * PEEK_PHOTO.step + PAD * 2,
    height: PEEK_PHOTO.height + PAD * 2,
  };
}

/** Distância entre o ponteiro e a prévia, e a folga até a borda da janela. */
const GAP = 28;
const EDGE = 16;

export function peekPosition(
  pointerX: number,
  pointerY: number,
  viewportWidth: number,
  viewportHeight: number,
  box: { width: number; height: number } = peekBox(3),
): { x: number; y: number } {
  // À direita do ponteiro; sem espaço, à esquerda. Assim a caixa nunca cobre a seta.
  const right = pointerX + GAP;
  const x = right + box.width <= viewportWidth - EDGE ? right : pointerX - GAP - box.width;
  // Logo abaixo do ponteiro (a linha de cima continua à vista), presa dentro da janela.
  const below = pointerY + GAP;
  const y = below + box.height <= viewportHeight - EDGE ? below : pointerY - GAP - box.height;
  return { x: Math.max(x, EDGE), y: Math.max(y, EDGE) };
}
