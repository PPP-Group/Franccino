import { describe, expect, it } from 'vitest';
import {
  addItem,
  clampQuantity,
  parseStoredItems,
  quoteItemKey,
  removeItem,
  setItemQuantity,
  totalQuantity,
} from './list';
import type { QuoteItem, QuoteItemInput } from './types';

const nogueira = { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' };
const linho = { id: 201, group: 'Tecido', name: 'Linho cru', code: 'TC-110' };

const input = (overrides: Partial<QuoteItemInput> = {}): QuoteItemInput => ({
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt',
  name: 'Cadeira Aura',
  image: null,
  finishes: [nogueira, linho],
  ...overrides,
});

describe('quote list', () => {
  it('adds a new item with quantity 1 and an empty note', () => {
    const { items, status } = addItem([], input());
    expect(status).toBe('added');
    expect(items).toEqual([{ ...input(), quantity: 1, note: '' }]);
  });

  it('merges the same product and finishes regardless of finish order', () => {
    const first = addItem([], input({ quantity: 2, note: 'Sala 5 × 4 m' })).items;
    const { items, status } = addItem(first, input({ finishes: [linho, nogueira], quantity: 3 }));
    expect(status).toBe('merged');
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(5);
    expect(items[0]!.note).toBe('Sala 5 × 4 m');
  });

  it('replaces the note when a new one is given and caps the merged quantity', () => {
    const first = addItem([], input({ quantity: 98 })).items;
    const { items } = addItem(first, input({ quantity: 5, note: 'Varanda' }));
    expect(items[0]!.quantity).toBe(99);
    expect(items[0]!.note).toBe('Varanda');
  });

  it('keeps different finishes as separate items', () => {
    const first = addItem([], input()).items;
    const { items } = addItem(first, input({ finishes: [] }));
    expect(items).toHaveLength(2);
  });

  it('refuses the 51st item', () => {
    const full: QuoteItem[] = Array.from({ length: 50 }, (_, index) => ({
      ...input({ productId: index + 1 }),
      quantity: 1,
      note: '',
    }));
    const { items, status } = addItem(full, input({ productId: 999 }));
    expect(status).toBe('full');
    expect(items).toBe(full);
  });

  it('clamps quantities to 1..99 integers', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(150)).toBe(99);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

  it('updates, removes and totals by key', () => {
    const items = addItem(addItem([], input()).items, input({ productId: 13, finishes: [] })).items;
    const key = quoteItemKey(items[0]!);
    expect(key).toBe('12:101,201');
    expect(setItemQuantity(items, key, 4)[0]!.quantity).toBe(4);
    expect(removeItem(items, key)).toHaveLength(1);
    expect(totalQuantity(setItemQuantity(items, key, 4))).toBe(5);
  });

  it('parses stored items and drops anything invalid', () => {
    const valid = { ...input(), quantity: 2, note: '' };
    const raw = JSON.stringify([valid, { slug: 'cadeira-aura', finishes: { madeira: 'nogueira' }, qty: 6 }]);
    expect(parseStoredItems(raw)).toEqual([valid]);
    expect(parseStoredItems('not json')).toEqual([]);
    expect(parseStoredItems(null)).toEqual([]);
    expect(parseStoredItems('{"a":1}')).toEqual([]);
  });
});
