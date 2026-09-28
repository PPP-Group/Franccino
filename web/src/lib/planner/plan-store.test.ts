import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addPiece, EMPTY_PLAN } from './plan';
import { getPlan, getServerPlan, resetPlanStoreForTests, savePlan, subscribePlan } from './plan-store';
import { PLAN_STORAGE_KEY } from './types';

const sofa = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt' as const,
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect' as const,
  image: null,
};

describe('plan store', () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    resetPlanStoreForTests();
    storage = new Map();
    vi.stubGlobal(
      'window',
      Object.assign(new EventTarget(), {
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => storage.set(key, value),
        },
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts empty, saves, notifies and keeps a stable snapshot', () => {
    expect(getServerPlan()).toBe(EMPTY_PLAN);
    expect(getPlan()).toBe(EMPTY_PLAN);
    const listener = vi.fn();
    subscribePlan(listener);
    savePlan(addPiece(EMPTY_PLAN, sofa));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.has(PLAN_STORAGE_KEY)).toBe(true);
    expect(getPlan().pieces).toHaveLength(1);
    expect(getPlan()).toBe(getPlan());
  });
});
