import { describe, expect, it } from 'vitest';
import {
  addRecent,
  localizeRecent,
  parseRecent,
  RECENT_LIMIT,
  seenProduct,
  type RecentProduct,
} from './store';

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

describe('recent products in each language', () => {
  const aura = { id: 7, slug: 'cadeira-aura', name: 'Cadeira Aura', cover: null, is_new: false };

  it('keeps the address of the piece in each language and opens the one of the page', () => {
    const seen = seenProduct(aura, 'pt', { pt: 'cadeira-aura', en: 'aura-chair' });
    const [en] = localizeRecent([seen], 'en');
    expect(en?.slug).toBe('aura-chair');
    expect(localizeRecent([seen], 'pt')[0]?.slug).toBe('cadeira-aura');
  });

  it('shows the name seen in the language of the page, or the one it has', () => {
    const pt = seenProduct(aura, 'pt', { pt: 'cadeira-aura', en: 'aura-chair' });
    const en = seenProduct(
      { ...aura, slug: 'aura-chair', name: 'Aura Chair' },
      'en',
      { pt: 'cadeira-aura' },
      pt,
    );
    expect(localizeRecent([en], 'pt')[0]?.name).toBe('Cadeira Aura');
    expect(localizeRecent([en], 'en')[0]?.name).toBe('Aura Chair');
    expect(localizeRecent([pt], 'en')[0]?.name).toBe('Cadeira Aura');
  });

  it('leaves out an old piece saved in Portuguese only when the page is in English', () => {
    const old = item(3);
    expect(localizeRecent([old], 'en')).toEqual([]);
    expect(localizeRecent([old], 'pt')).toEqual([old]);
  });
});
