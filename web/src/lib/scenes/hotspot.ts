/**
 * Posição dos pontos de um ambiente (banco de ideias, ideia 7). O painel guarda `x` e `y` em porcentagem da foto; aqui
 * se garante que o ponto fica dentro dela e se escolhe para que lado o cartão da peça abre, para nunca sair da foto.
 */

export type HotspotPlacement = {
  left: string;
  top: string;
  /** O cartão abre para a esquerda quando o ponto está na metade direita da foto. */
  horizontal: 'start' | 'end';
  /** E para cima quando o ponto está na parte de baixo. */
  vertical: 'above' | 'below';
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }
  return Math.min(Math.max(value, 0), 100);
}

export function placeHotspot(x: number, y: number): HotspotPlacement {
  const left = clampPercent(x);
  const top = clampPercent(y);
  return {
    left: `${left}%`,
    top: `${top}%`,
    horizontal: left > 55 ? 'end' : 'start',
    vertical: top > 55 ? 'above' : 'below',
  };
}

/**
 * Ponto de uma foto mostrada com `object-fit: cover` num quadro de outra proporção (a faixa do Corporativo, 3:2): a
 * foto cresce até cobrir o quadro e a sobra sai igual dos dois lados. Devolve a posição no quadro, em porcentagem, ou
 * `null` quando o ponto ficou na parte recortada. `imageRatio` e `frameRatio` são largura / altura.
 */
export function coverPoint(
  x: number,
  y: number,
  imageRatio: number,
  frameRatio: number,
): { x: number; y: number } | null {
  if (!(imageRatio > 0) || !(frameRatio > 0)) {
    return { x, y };
  }
  // Fração da foto que fica à vista em cada eixo.
  const visibleX = Math.min(1, frameRatio / imageRatio);
  const visibleY = Math.min(1, imageRatio / frameRatio);
  const mappedX = (x - ((1 - visibleX) / 2) * 100) / visibleX;
  const mappedY = (y - ((1 - visibleY) / 2) * 100) / visibleY;
  // Um ponto colado na borda do quadro esconderia metade do círculo: só os que ficam com folga de 2%.
  if (mappedX < 2 || mappedX > 98 || mappedY < 2 || mappedY > 98) {
    return null;
  }
  return { x: Math.round(mappedX * 100) / 100, y: Math.round(mappedY * 100) / 100 };
}
