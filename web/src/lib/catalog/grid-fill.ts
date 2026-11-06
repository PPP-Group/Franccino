/**
 * Grade sempre completa (rodada 3, regra 1): quantas células sobram na última linha da grade de peças, nas duas
 * larguras da grade (3 colunas no desktop, 2 no tablet e no celular, `.grid-plates` em plates.css). Calculado no
 * servidor com o número de peças conhecido.
 */
export const GRID_COLUMNS = { desktop: 3, compact: 2 } as const;

export function emptyCells(count: number, columns: number): number {
  return count === 0 ? 0 : (columns - (count % columns)) % columns;
}

/**
 * Classes do bloco complementar: `grid-fill--d{n}` diz quantas colunas ele ocupa no desktop e `grid-fill--m{n}` no
 * tablet e no celular (0 = escondido). `null` quando a grade já fecha nas duas larguras.
 */
export function gridFillClass(count: number): string | null {
  const desktop = emptyCells(count, GRID_COLUMNS.desktop);
  const compact = emptyCells(count, GRID_COLUMNS.compact);
  if (desktop === 0 && compact === 0) {
    return null;
  }
  return `grid-fill--d${desktop} grid-fill--m${compact}`;
}
