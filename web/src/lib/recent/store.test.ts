import { describe, expect, it } from 'vitest';
import { addRecent, parseRecent, RECENT_LIMIT, type RecentProduct } from './store';

const item = (id: number): RecentProduct => ({
  id,
  slug: `peca-${id}`,
  name: `Peça ${id}`,
  cover: null,
  is_new: false,
});

describe('recent products', () => {
  it('puts the last seen piece first, without repeating it', () => {
    expect(addRecent([item(1), item(2)], item(2)).map((p) => p.id)).toEqual([2, 1]);
  });

  it('keeps only the latest pieces', () => {
    const list = Array.from({ length: RECENT_LIMIT }, (_, i) => item(i + 1));
    const next = addRecent(list, item(99));
    expect(next).toHaveLength(RECENT_LIMIT);
    expect(next[0]?.id).toBe(99);
  });

  it('ignores broken saved data', () => {
    expect(parseRecent('nada')).toEqual([]);
    expect(parseRecent(JSON.stringify([{ id: 'x' }, item(3)]))).toEqual([item(3)]);
  });
});
