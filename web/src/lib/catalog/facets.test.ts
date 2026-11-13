import { describe, expect, it } from 'vitest';
import { buildFacetMatrix, crossCounts } from './facets';

const products = [
  { category: 'aparadores', designer: 'ana', collections: ['tempo'], rooms: ['living'] },
  { category: 'aparadores', designer: 'bia', collections: [], rooms: ['dining'] },
  { category: 'cadeiras', designer: 'ana', collections: ['tempo'], rooms: ['dining'] },
  { category: 'cadeiras', designer: 'ana', collections: ['tempo', 'avito'], rooms: [] },
  { category: null, designer: null, collections: [], rooms: [] },
];
const matrix = buildFacetMatrix(products, ['category', 'room', 'collection', 'designer']);

describe('crossCounts', () => {
  it('counts every option over all pieces when nothing is chosen', () => {
    const counts = crossCounts(matrix, {});
    expect(counts.category.get('aparadores')).toBe(2);
    expect(counts.collection.get('tempo')).toBe(3);
    expect(counts.designer.get('ana')).toBe(3);
  });

  it('narrows the other filters to the chosen category', () => {
    const counts = crossCounts(matrix, { category: 'aparadores' });
    expect(counts.collection.get('tempo')).toBe(1);
    expect(counts.collection.get('avito')).toBeUndefined();
    expect(counts.designer.get('bia')).toBe(1);
    // A própria categoria continua contada sobre tudo: dá para trocar de categoria.
    expect(counts.category.get('cadeiras')).toBe(2);
  });

  it('crosses several filters at once', () => {
    const counts = crossCounts(matrix, { category: 'cadeiras', collection: 'tempo' });
    expect(counts.designer.get('ana')).toBe(2);
    expect(counts.room.get('dining')).toBe(1);
    expect(counts.category.get('aparadores')).toBe(1);
    expect(counts.collection.get('avito')).toBe(1);
  });

  it('gives zero to everything when a chosen value has no piece', () => {
    const counts = crossCounts(matrix, { collection: 'inexistente' });
    expect(counts.category.size).toBe(0);
    expect(counts.collection.get('tempo')).toBe(3);
  });
});
