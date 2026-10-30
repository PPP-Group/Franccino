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
