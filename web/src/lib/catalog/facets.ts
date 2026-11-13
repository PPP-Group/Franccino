/**
 * Filtros ligados entre si (retorno de 13/11/2026): a contagem de cada opção leva em conta os outros filtros
 * escolhidos. Com "Aparadores e buffets" escolhido, a coleção Tempo mostra quantas peças dela são aparadores (0, se
 * nenhuma), antes mesmo de aplicar. É a contagem "disjuntiva" de busca facetada: a opção de um filtro é contada sobre
 * as peças que passam por todos os *outros* filtros, então trocar a opção do mesmo filtro continua possível.
 */
import type { FacetProduct } from '@/lib/api/types';

/** Os filtros da barra do catálogo, com o nome do parâmetro na URL. */
export type FacetName = 'category' | 'room' | 'collection' | 'designer';

/**
 * As chaves de cada peça em índices (as opções de cada filtro numa lista só), para a página levar pouco ao navegador:
 * `rows[peça][filtro]` são os índices das opções que a peça tem naquele filtro.
 */
export type FacetMatrix = {
  names: FacetName[];
  values: string[][];
  rows: number[][][];
};

export type FacetSelection = Partial<Record<FacetName, string>>;

function keysOf(product: FacetProduct, name: FacetName): string[] {
  switch (name) {
    case 'category':
      return product.category ? [product.category] : [];
    case 'designer':
      return product.designer ? [product.designer] : [];
    case 'collection':
      return product.collections;
    case 'room':
      return product.rooms;
  }
}

/** Monta a matriz no servidor, só com os filtros que a barra mostra. */
export function buildFacetMatrix(products: FacetProduct[], names: FacetName[]): FacetMatrix {
  const values = names.map(() => [] as string[]);
  const index = names.map(() => new Map<string, number>());
  const rows = products.map((product) =>
    names.map((name, d) =>
      keysOf(product, name).map((key) => {
        let i = index[d]!.get(key);
        if (i === undefined) {
          i = values[d]!.length;
          values[d]!.push(key);
          index[d]!.set(key, i);
        }
        return i;
      }),
    ),
  );
  return { names, values, rows };
}

/**
 * Para cada filtro, quantas peças cada opção teria com os outros filtros escolhidos. Uma opção que não aparece no
 * mapa tem 0.
 */
export function crossCounts(
  matrix: FacetMatrix,
  selection: FacetSelection,
): Record<FacetName, Map<string, number>> {
  const { names, values, rows } = matrix;
  // O índice escolhido em cada filtro (-1: todos; -2: valor que nenhuma peça tem, então nada passa).
  const chosen = names.map((name, d) => {
    const value = selection[name];
    if (!value) return -1;
    const i = values[d]!.indexOf(value);
    return i === -1 ? -2 : i;
  });
  const counts = names.map(() => new Map<number, number>());
  for (const row of rows) {
    const passes = names.map((_, d) => chosen[d] === -1 || row[d]!.includes(chosen[d]!));
    const failing = passes.filter((ok) => !ok).length;
    names.forEach((_, d) => {
      // Conta no filtro d se a peça passa por todos os outros (ela pode não passar pelo próprio d).
      if (failing === 0 || (failing === 1 && !passes[d])) {
        for (const i of row[d]!) counts[d]!.set(i, (counts[d]!.get(i) ?? 0) + 1);
      }
    });
  }
  const result = {} as Record<FacetName, Map<string, number>>;
  names.forEach((name, d) => {
    result[name] = new Map([...counts[d]!].map(([i, count]) => [values[d]![i]!, count]));
  });
  return result;
}
