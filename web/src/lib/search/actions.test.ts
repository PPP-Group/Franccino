import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchResult } from '@/lib/api/types';

const search = vi.fn();
const getProductDetails = vi.fn();
vi.mock('@/lib/api/catalog', () => ({
  search: (...args: unknown[]) => search(...args),
  getProductDetails: (...args: unknown[]) => getProductDetails(...args),
}));

const { suggestSearch } = await import('./actions');

const result = { products: [{ slug: 'aura', name: 'Aura', cover: null }], designers: [], collections: [] };

describe('suggestSearch', () => {
  afterEach(() => {
    search.mockReset();
    getProductDetails.mockReset();
  });

  it('não consulta a API com texto curto', async () => {
    expect(await suggestSearch('pt', 'a')).toEqual([]);
    expect(search).not.toHaveBeenCalled();
  });

  it('troca um idioma desconhecido pelo padrão e normaliza o texto', async () => {
    search.mockResolvedValue(result as unknown as SearchResult);
    getProductDetails.mockResolvedValue([]);

    const list = await suggestSearch('xx', '  cadeira   aura ');

    expect(search).toHaveBeenCalledWith('pt', 'cadeira aura');
    expect(list).toEqual([{ kind: 'product', slug: 'aura', name: 'Aura', image: null }]);
  });

  it('a peça ganha os dados da tabela técnica e as fotos do hover', async () => {
    search.mockResolvedValue(result as unknown as SearchResult);
    getProductDetails.mockResolvedValue([
      {
        slug: 'aura',
        category: { name: 'Cadeiras' },
        area: { key: 'indoor', brand_name: 'Franccino Casa' },
        designer: { name: 'Daniela Ferro' },
        dimensions: [{ width: 60, depth: 55, height: 80, seat_height: null, diameter: null }],
        cover: null,
        gallery: [],
      },
    ]);

    const [item] = await suggestSearch('pt', 'aura');

    expect(getProductDetails).toHaveBeenCalledWith('pt', ['aura']);
    expect(item?.facts).toMatchObject({
      category: 'Cadeiras',
      line: 'Franccino Casa',
      designer: 'Daniela Ferro',
    });
    expect(item?.facts?.dimension).toMatchObject({ width: 60 });
    expect(item?.preview).toEqual([]);
  });

  it('sem o detalhe das peças, a sugestão sai só com foto e nome', async () => {
    search.mockResolvedValue(result as unknown as SearchResult);
    getProductDetails.mockRejectedValue(new Error('lenta'));

    expect(await suggestSearch('pt', 'aura')).toEqual([
      { kind: 'product', slug: 'aura', name: 'Aura', image: null },
    ]);
  });

  it('devolve lista vazia quando a API falha', async () => {
    search.mockRejectedValue(new Error('fora do ar'));

    expect(await suggestSearch('en', 'aura')).toEqual([]);
  });
});
