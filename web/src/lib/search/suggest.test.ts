import { describe, expect, it } from 'vitest';
import type { SearchResult } from '@/lib/api/types';
import { normalizeSuggestQuery, toSuggestions } from './suggest';

describe('normalizeSuggestQuery', () => {
  it('recusa texto curto e aceita a partir de 2 letras', () => {
    expect(normalizeSuggestQuery(' a ')).toBeNull();
    expect(normalizeSuggestQuery('  ma  ')).toBe('ma');
  });

  it('junta espaços e limita o tamanho', () => {
    expect(normalizeSuggestQuery('mesa   de   centro')).toBe('mesa de centro');
    expect(normalizeSuggestQuery('x'.repeat(200))).toHaveLength(80);
  });
});

describe('toSuggestions', () => {
  it('limita cada grupo e mantém a ordem peças, designers, coleções', () => {
    const result = {
      products: Array.from({ length: 9 }, (_, i) => ({ slug: `p${i}`, name: `Peça ${i}` })),
      designers: Array.from({ length: 4 }, (_, i) => ({ slug: `d${i}`, name: `Designer ${i}` })),
      collections: [{ slug: 'tempo', name: 'Tempo' }],
    } as unknown as SearchResult;

    const list = toSuggestions(result);

    expect(list.map((item) => item.kind)).toEqual([
      ...Array(6).fill('product'),
      ...Array(2).fill('designer'),
      'collection',
    ]);
    expect(list[0]).toEqual({ kind: 'product', slug: 'p0', name: 'Peça 0' });
  });
});
