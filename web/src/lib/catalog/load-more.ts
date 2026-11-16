import type { ProductListParams } from '@/lib/api/catalog';

/** Quantas vezes o "Ver mais" soma peças na mesma página antes de virar o link da página seguinte. */
export const MAX_LOADS = 3;

const KEYS = [
  'area',
  'category',
  'designer',
  'collection',
  'line',
  'finish',
  'room',
  'launch',
  'q',
  'sort',
] as const;

/**
 * Filtros aceitos pelo "Ver mais" (entrada do navegador): só os da listagem, como texto curto. A página e o tamanho
 * da página vêm do servidor.
 */
export function sanitizeListQuery(query: unknown): ProductListParams {
  const source = query && typeof query === 'object' ? (query as Record<string, unknown>) : {};
  const clean: Record<string, string> = {};
  for (const key of KEYS) {
    const value = source[key];
    if ((typeof value === 'string' || typeof value === 'number') && String(value).length <= 120) {
      clean[key] = String(value);
    }
  }
  return clean as ProductListParams;
}

export type LoadMoreState = {
  /** Até qual página da API as peças já estão na tela. */
  page: number;
  /** Quantas vezes o botão já somou peças nesta página. */
  loads: number;
};

/** O que mostrar embaixo da grade: o botão, o link da página seguinte (depois de `MAX_LOADS`) ou nada. */
export function loadMoreAction(state: LoadMoreState, lastPage: number): 'button' | 'next-page' | 'none' {
  if (state.page >= lastPage) return 'none';
  return state.loads >= MAX_LOADS ? 'next-page' : 'button';
}

/**
 * Página onde começa o trecho anterior da grade (retorno de 16/11/2026: não havia como voltar sem a seta do navegador).
 * Cada trecho é uma página aberta mais `MAX_LOADS` somadas pelo "Ver mais" (1, 5, 9…), então o anterior começa
 * `MAX_LOADS + 1` páginas antes. Sem trecho anterior, `null`.
 */
export function previousStart(page: number): number | null {
  if (page <= 1) return null;
  return Math.max(1, page - (MAX_LOADS + 1));
}

/**
 * "Ver menos": desfaz o último "Ver mais", tirando as peças que ele somou (cada soma traz uma página inteira, menos
 * talvez a última da lista, que fica no fim). Sem soma, nada muda.
 */
export function undoLoad<T>(
  state: LoadMoreState & { items: T[] },
  perPage: number,
): LoadMoreState & { items: T[] } {
  if (state.loads === 0) return state;
  return {
    page: state.page - 1,
    loads: state.loads - 1,
    items: state.items.slice(0, (state.loads - 1) * perPage),
  };
}
