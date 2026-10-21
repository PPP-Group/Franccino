import { afterEach, describe, expect, it, vi } from 'vitest';

const loadPlannerProducts = vi.fn();
vi.mock('./data', () => ({ loadPlannerProducts: (...args: unknown[]) => loadPlannerProducts(...args) }));

const { searchPlannerPieces } = await import('./actions');

describe('searchPlannerPieces', () => {
  afterEach(() => loadPlannerProducts.mockReset());

  it('não busca sem texto válido', async () => {
    expect(await searchPlannerPieces('pt', '   ')).toEqual([]);
    expect(loadPlannerProducts).not.toHaveBeenCalled();
  });

  it('limita a busca e troca um idioma desconhecido pelo padrão', async () => {
    loadPlannerProducts.mockResolvedValue([]);

    await searchPlannerPieces('fr', 'mesa');

    expect(loadPlannerProducts).toHaveBeenCalledWith('pt', { q: 'mesa', per_page: 12 });
  });
});
