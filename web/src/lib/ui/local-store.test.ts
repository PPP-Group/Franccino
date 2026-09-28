import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalStore } from './local-store';

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

function numberList(raw: string | null): number[] {
  if (!raw) {
    return [];
  }
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((entry): entry is number => typeof entry === 'number') : [];
  } catch {
    return [];
  }
}

describe('createLocalStore', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('persists to localStorage and notifies subscribers, scoped by key', () => {
    const storage = new MemoryStorage();
    installWindow(storage);
    const store = createLocalStore<number[]>({ key: 'test.a', parse: numberList, empty: [] });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.set([1, 2]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.getItem('test.a')!)).toEqual([1, 2]);

    unsubscribe();
    store.set([3]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('returns the same reference while storage is unchanged', () => {
    installWindow(new MemoryStorage());
    const store = createLocalStore<number[]>({ key: 'test.b', parse: numberList, empty: [] });
    store.set([1]);
    expect(store.get()).toBe(store.get());
  });

  it('falls back to memory when storage refuses writes', () => {
    installWindow(new MemoryStorage(true));
    const store = createLocalStore<number[]>({ key: 'test.c', parse: numberList, empty: [] });
    store.set([1, 2, 3]);
    expect(store.get()).toEqual([1, 2, 3]);
  });

  it('reacts to storage events from other tabs, ignoring other keys', () => {
    const target = installWindow(new MemoryStorage());
    const store = createLocalStore<number[]>({ key: 'test.d', parse: numberList, empty: [] });
    const listener = vi.fn();
    store.subscribe(listener);
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'test.d' }));
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'other' }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resets its cache so a later get() re-reads storage (as between tests)', () => {
    installWindow(new MemoryStorage());
    const store = createLocalStore<number[]>({ key: 'test.e', parse: numberList, empty: [] });
    store.set([1]);
    store.reset();
    installWindow(new MemoryStorage());
    expect(store.get()).toEqual([]);
  });
});
