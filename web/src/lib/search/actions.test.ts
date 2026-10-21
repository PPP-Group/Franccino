import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchResult } from '@/lib/api/types';

const search = vi.fn();
vi.mock('@/lib/api/catalog', () => ({ search: (...args: unknown[]) => search(...args) }));

const { suggestSearch } = await import('./actions');

const result = { products: [{ slug: 'aura', name: 'Aura', cover: null }], designers: [], collections: [] };

describe('suggestSearch', () => {
  afterEach(() => search.mockReset());

  it('não consulta a API com texto curto', async () => {
    expect(await suggestSearch('pt', 'a')).toEqual([]);
    expect(search).not.toHaveBeenCalled();
  });

  it('troca um idioma desconhecido pelo padrão e normaliza o texto', async () => {
    search.mockResolvedValue(result as unknown as SearchResult);

    const list = await suggestSearch('xx', '  cadeira   aura ');

    expect(search).toHaveBeenCalledWith('pt', 'cadeira aura');
    expect(list).toEqual([{ kind: 'product', slug: 'aura', name: 'Aura', image: null }]);
  });

  it('devolve lista vazia quando a API falha', async () => {
    search.mockRejectedValue(new Error('fora do ar'));

    expect(await suggestSearch('en', 'aura')).toEqual([]);
  });
});
