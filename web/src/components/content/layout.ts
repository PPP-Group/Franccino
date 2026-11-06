/**
 * Regras de composição das páginas de conteúdo (rodada 3, retorno do tech lead em 06/11/2026). Lógica pura, sem
 * React: os componentes só ligam o resultado ao markup.
 *
 * - Grade sempre completa: quantas células faltam para a última linha não ficar com buraco.
 * - Galeria editorial: imagens alternando uma na largura toda e duas lado a lado.
 */

/** Células que faltam para fechar a última linha de uma grade de `columns` colunas (0 quando já fecha). */
export function missingCells(count: number, columns: number): number {
  if (count <= 0 || columns <= 1) {
    return 0;
  }
  return (columns - (count % columns)) % columns;
}

export type GalleryGroup = { kind: 'full' | 'pair'; indexes: number[] };

/**
 * Ritmo da galeria editorial: uma imagem na largura toda, depois duas lado a lado, e assim por diante. Nunca sobra
 * uma imagem sozinha numa linha de duas: com duas restando, elas formam o par; com uma, ela vai na largura toda.
 */
export function editorialRhythm(count: number): GalleryGroup[] {
  const groups: GalleryGroup[] = [];
  let index = 0;
  let next: GalleryGroup['kind'] = 'full';
  while (index < count) {
    const remaining = count - index;
    const kind: GalleryGroup['kind'] = remaining === 1 ? 'full' : remaining === 2 ? 'pair' : next;
    const size = kind === 'full' ? 1 : 2;
    groups.push({ kind, indexes: Array.from({ length: size }, (_, offset) => index + offset) });
    index += size;
    next = kind === 'full' ? 'pair' : 'full';
  }
  return groups;
}

/**
 * Os `limit` itens seguintes ao atual numa lista, dando a volta no começo, sem o próprio atual ("Outras coleções",
 * "Outros designers"): cada página mostra vizinhos diferentes, e não sempre os primeiros da lista.
 */
export function neighbours<T>(items: T[], isCurrent: (item: T) => boolean, limit: number): T[] {
  const start = items.findIndex(isCurrent);
  const others = start === -1 ? items : [...items.slice(start + 1), ...items.slice(0, start)];
  return others.filter((item) => !isCurrent(item)).slice(0, limit);
}

/**
 * Peça para a coluna da direita que ficaria vazia (retorno do tech lead de 06/11/2026: "nada de metade vazia"): a
 * primeira com foto, procurando nas listas na ordem dada (as peças da própria página primeiro, depois os destaques da
 * home), sem as que `exclude` já mostra. Sem nenhuma, `null`, e a coluna some.
 */
export function firstWithCover<T extends { id: number; cover: unknown }>(
  lists: T[][],
  exclude: number[] = [],
): T | null {
  for (const list of lists) {
    const found = list.find((item) => item.cover && !exclude.includes(item.id));
    if (found) {
      return found;
    }
  }
  return null;
}
