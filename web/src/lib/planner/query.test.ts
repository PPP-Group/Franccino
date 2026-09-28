import { describe, expect, it } from 'vitest';
import { parsePlannerQuery } from './query';

describe('parsePlannerQuery', () => {
  it('accepts 2 to 60 characters, trimmed', () => {
    expect(parsePlannerQuery('  sofá ')).toBe('sofá');
    expect(parsePlannerQuery('s')).toBeNull();
    expect(parsePlannerQuery('x'.repeat(61))).toBeNull();
    expect(parsePlannerQuery(42)).toBeNull();
  });
});
