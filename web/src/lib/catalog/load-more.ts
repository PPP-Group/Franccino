import type { ProductListParams } from '@/lib/api/catalog';

/** Quantas vezes o "Ver mais" soma peças na mesma página antes de virar o link da página seguinte. */
export const MAX_LOADS = 3;

const KEYS = ['area', 'category', 'designer', 'collection', 'line', 'finish', 'launch', 'q', 'sort'] as const;

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
