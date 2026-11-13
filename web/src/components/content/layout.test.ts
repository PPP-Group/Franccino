import { describe, expect, it } from 'vitest';
import { editorialRhythm, firstWithCover, missingCells, neighbours } from './layout';

describe('missingCells', () => {
  it('counts the cells that close the last row', () => {
    expect(missingCells(11, 2)).toBe(1);
    expect(missingCells(12, 2)).toBe(0);
    expect(missingCells(16, 4)).toBe(0);
    expect(missingCells(13, 4)).toBe(3);
    expect(missingCells(5, 3)).toBe(1);
  });

  it('never fills an empty grid or a single column', () => {
    expect(missingCells(0, 3)).toBe(0);
    expect(missingCells(7, 1)).toBe(0);
  });
});

describe('editorialRhythm', () => {
  const kinds = (count: number) => editorialRhythm(count).map((group) => group.kind);

  it('alternates one wide image and a pair', () => {
    expect(kinds(3)).toEqual(['full', 'pair']);
    expect(kinds(6)).toEqual(['full', 'pair', 'full', 'pair']);
  });

  it('never leaves an image alone in a pair', () => {
    expect(kinds(1)).toEqual(['full']);
    expect(kinds(2)).toEqual(['pair']);
    expect(kinds(4)).toEqual(['full', 'pair', 'full']);
    expect(kinds(5)).toEqual(['full', 'pair', 'pair']);
  });

  it('keeps every image once, in order', () => {
    expect(editorialRhythm(5).flatMap((group) => group.indexes)).toEqual([0, 1, 2, 3, 4]);
    expect(editorialRhythm(0)).toEqual([]);
  });
});

describe('neighbours', () => {
  const list = ['a', 'b', 'c', 'd', 'e'];

  it('takes the next items after the current one, wrapping around', () => {
    expect(neighbours(list, (item) => item === 'd', 3)).toEqual(['e', 'a', 'b']);
    expect(neighbours(list, (item) => item === 'a', 2)).toEqual(['b', 'c']);
  });

  it('works when the current item is not in the list', () => {
    expect(neighbours(list, (item) => item === 'z', 2)).toEqual(['a', 'b']);
  });
});

describe('firstWithCover', () => {
  const piece = (id: number, cover: string | null) => ({ id, cover });

  it('takes the first piece with a photo, in list order', () => {
    expect(firstWithCover([[piece(1, null), piece(2, 'a')], [piece(3, 'b')]])?.id).toBe(2);
  });

  it('falls back to the next list and skips excluded pieces', () => {
    expect(firstWithCover([[piece(1, 'a')], [piece(3, 'b')]], [1])?.id).toBe(3);
  });

  it('returns null without any photo', () => {
    expect(firstWithCover([[piece(1, null)], []])).toBeNull();
  });
});
