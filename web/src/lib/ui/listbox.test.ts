import { describe, expect, it } from 'vitest';
import { isTypeAheadKey, nextListboxIndex, typeAheadIndex } from './listbox';

describe('nextListboxIndex', () => {
  it('moves with the arrows without wrapping', () => {
    expect(nextListboxIndex(3, 0, 'ArrowDown')).toBe(1);
    expect(nextListboxIndex(3, 2, 'ArrowDown')).toBe(2);
    expect(nextListboxIndex(3, 0, 'ArrowUp')).toBe(0);
    expect(nextListboxIndex(3, 2, 'ArrowUp')).toBe(1);
  });

  it('starts from nothing selected', () => {
    expect(nextListboxIndex(3, -1, 'ArrowDown')).toBe(0);
    expect(nextListboxIndex(3, -1, 'ArrowUp')).toBe(2);
  });

  it('jumps with Home, End and the page keys', () => {
    expect(nextListboxIndex(30, 12, 'Home')).toBe(0);
    expect(nextListboxIndex(30, 12, 'End')).toBe(29);
    expect(nextListboxIndex(30, 12, 'PageDown')).toBe(22);
    expect(nextListboxIndex(30, 25, 'PageDown')).toBe(29);
    expect(nextListboxIndex(30, 4, 'PageUp')).toBe(0);
  });

  it('ignores other keys and empty lists', () => {
    expect(nextListboxIndex(3, 0, 'a')).toBeNull();
    expect(nextListboxIndex(0, 0, 'ArrowDown')).toBeNull();
  });
});

describe('typeAheadIndex', () => {
  const labels = ['Todos os estados', 'SP', 'São Paulo', 'Santa Catarina', 'Rio de Janeiro'];

  it('finds the next option starting with the letter, wrapping around', () => {
    expect(typeAheadIndex(labels, 's', 0)).toBe(1);
    expect(typeAheadIndex(labels, 's', 1)).toBe(2);
    expect(typeAheadIndex(labels, 's', 3)).toBe(1);
  });

  it('cycles when the same letter is repeated', () => {
    expect(typeAheadIndex(labels, 'ss', 1)).toBe(2);
  });

  it('matches a word ignoring case and accents', () => {
    expect(typeAheadIndex(labels, 'sao', 0)).toBe(2);
    expect(typeAheadIndex(labels, 'SANTA', 2)).toBe(3);
  });

  it('returns null without a match', () => {
    expect(typeAheadIndex(labels, 'x', 0)).toBeNull();
    expect(typeAheadIndex([], 'a', 0)).toBeNull();
  });
});

describe('isTypeAheadKey', () => {
  it('accepts printable characters only', () => {
    const base = { ctrlKey: false, altKey: false, metaKey: false };
    expect(isTypeAheadKey({ ...base, key: 'a' })).toBe(true);
    expect(isTypeAheadKey({ ...base, key: 'ArrowDown' })).toBe(false);
    expect(isTypeAheadKey({ ...base, key: 'a', ctrlKey: true })).toBe(false);
  });
});
