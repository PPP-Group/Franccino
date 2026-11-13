import { afterEach, describe, expect, it, vi } from 'vitest';

const loadPlannerLibrary = vi.fn();
vi.mock('./data', () => ({ loadPlannerLibrary: (...args: unknown[]) => loadPlannerLibrary(...args) }));

const { searchPlannerPieces } = await import('./actions');

describe('searchPlannerPieces', () => {
  afterEach(() => loadPlannerLibrary.mockReset());

  it('não busca sem texto válido', async () => {
    expect(await searchPlannerPieces('pt', '   ')).toEqual([]);
    expect(loadPlannerLibrary).not.toHaveBeenCalled();
  });

  it('limita a busca e troca um idioma desconhecido pelo padrão', async () => {
    loadPlannerLibrary.mockResolvedValue([]);

    await searchPlannerPieces('fr', 'mesa');

    expect(loadPlannerLibrary).toHaveBeenCalledWith('pt', { q: 'mesa', per_page: 12 });
  });
});
