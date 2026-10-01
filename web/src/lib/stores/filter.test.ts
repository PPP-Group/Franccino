import { describe, expect, it } from 'vitest';
import type { Store } from '@/lib/api/types';
import { filterStores } from './filter';

const store = (id: number, state: string, type: string) => ({ id, state, type }) as Store;
const stores = [store(1, 'MG', 'exclusive'), store(2, 'SP', 'reseller'), store(3, 'SP', 'exclusive')];

describe('filterStores', () => {
  it('filters by state and type, null meaning all', () => {
    expect(filterStores(stores, { state: null, type: null }).map((s) => s.id)).toEqual([1, 2, 3]);
    expect(filterStores(stores, { state: 'SP', type: null }).map((s) => s.id)).toEqual([2, 3]);
    expect(filterStores(stores, { state: 'SP', type: 'exclusive' }).map((s) => s.id)).toEqual([3]);
    expect(filterStores(stores, { state: null, type: 'reseller' }).map((s) => s.id)).toEqual([2]);
  });
});
