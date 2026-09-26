import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getQuoteItems, quoteActions, resetQuoteStoreForTests, subscribeQuote } from './store';
import { QUOTE_STORAGE_KEY } from './types';

class MemoryStorage {
  private readonly map = new Map<string, string>();
  constructor(private readonly failOnWrite = false) {}
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failOnWrite) {
      throw new Error('QuotaExceededError');
    }
    this.map.set(key, value);
  }
}

function installWindow(storage: MemoryStorage) {
  const target = new EventTarget();
  vi.stubGlobal('window', Object.assign(target, { localStorage: storage }));
  return target;
}

const aura = {
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt' as const,
  name: 'Cadeira Aura',
  image: null,
  finishes: [],
};

describe('quote store', () => {
  beforeEach(() => resetQuoteStoreForTests());
  afterEach(() => vi.unstubAllGlobals());

  it('persists to localStorage and notifies subscribers', () => {
    const storage = new MemoryStorage();
    installWindow(storage);
    const listener = vi.fn();
    const unsubscribe = subscribeQuote(listener);

    expect(quoteActions.add(aura)).toBe('added');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.getItem(QUOTE_STORAGE_KEY)!)).toHaveLength(1);

    unsubscribe();
    quoteActions.clear();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('returns the same array while storage is unchanged', () => {
    installWindow(new MemoryStorage());
    quoteActions.add(aura);
    expect(getQuoteItems()).toBe(getQuoteItems());
  });

  it('falls back to memory when storage refuses writes', () => {
    installWindow(new MemoryStorage(true));
    quoteActions.add(aura);
    expect(getQuoteItems()).toHaveLength(1);
  });

  it('reacts to storage events from other tabs', () => {
    const target = installWindow(new MemoryStorage());
    const listener = vi.fn();
    subscribeQuote(listener);
    target.dispatchEvent(Object.assign(new Event('storage'), { key: QUOTE_STORAGE_KEY }));
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'other' }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes by key and returns the removed item', () => {
    installWindow(new MemoryStorage());
    quoteActions.add(aura);
    expect(quoteActions.remove('12:')?.name).toBe('Cadeira Aura');
    expect(getQuoteItems()).toEqual([]);
    expect(quoteActions.remove('12:')).toBeNull();
  });
});
