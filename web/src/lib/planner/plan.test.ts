import { describe, expect, it } from 'vitest';
import {
  addPiece,
  EMPTY_PLAN,
  parsePlan,
  planEntries,
  planToQuoteInputs,
  removePiece,
  setRoom,
  updatePiece,
} from './plan';
import { MAX_PIECES, type PlannerProduct } from './types';

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};
const table: PlannerProduct = {
  ...sofa,
  id: 8,
  slug: 'mesa-joey',
  name: 'Mesa Joey',
  width: 130,
  depth: 130,
  shape: 'round',
};

describe('plan operations', () => {
  it('adds centred pieces and keeps a product snapshot', () => {
    const plan = addPiece(addPiece(EMPTY_PLAN, sofa), sofa);
    expect(plan.pieces).toEqual([
      { uid: 1, productId: 7, x: 130, y: 150, r: 0 },
      { uid: 2, productId: 7, x: 130, y: 150, r: 0 },
    ]);
    expect(plan.products['7']).toEqual(sofa);
    expect(planEntries(plan)).toHaveLength(2);
  });

  it('stops at the piece limit', () => {
    let plan = EMPTY_PLAN;
    for (let i = 0; i < MAX_PIECES; i += 1) {
      plan = addPiece(plan, sofa);
    }
    expect(addPiece(plan, sofa)).toBe(plan);
  });

  it('moves, rotates, removes and resizes', () => {
    const plan = addPiece(addPiece(EMPTY_PLAN, sofa), table);
    const moved = updatePiece(plan, 1, { x: 10, r: 90 });
    expect(moved.pieces[0]).toEqual({ uid: 1, productId: 7, x: 10, y: 150, r: 90 });
    const removed = removePiece(moved, 2);
    expect(removed.pieces).toHaveLength(1);
    expect(removed.products).not.toHaveProperty('8');
    expect(setRoom(removed, { w: 600, d: 450 }).room).toEqual({ w: 600, d: 450 });
  });

  it('turns the room into quote items with counts and the room note', () => {
    const plan = addPiece(addPiece(addPiece(EMPTY_PLAN, sofa), table), sofa);
    expect(planToQuoteInputs(plan, 'Sala 5,00 × 4,00 m')).toEqual([
      {
        productId: 7,
        slug: 'sofa-majestic',
        locale: 'pt',
        name: 'Sofá Majestic',
        image: null,
        finishes: [],
        quantity: 2,
        note: 'Sala 5,00 × 4,00 m',
      },
      {
        productId: 8,
        slug: 'mesa-joey',
        locale: 'pt',
        name: 'Mesa Joey',
        image: null,
        finishes: [],
        quantity: 1,
        note: 'Sala 5,00 × 4,00 m',
      },
    ]);
  });

  it('parses stored plans defensively', () => {
    const plan = addPiece(EMPTY_PLAN, sofa);
    expect(parsePlan(JSON.stringify(plan))).toEqual(plan);
    expect(parsePlan('nope')).toBe(EMPTY_PLAN);
    expect(parsePlan(null)).toBe(EMPTY_PLAN);
    expect(parsePlan(JSON.stringify({ ...plan, room: { w: 10, d: 10 } }))).toBe(EMPTY_PLAN);
    const orphan = { ...plan, products: {} };
    expect(parsePlan(JSON.stringify(orphan)).pieces).toEqual([]);
  });
});
