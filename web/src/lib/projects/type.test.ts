import { describe, expect, it } from 'vitest';
import { parseProjectType } from './type';

describe('parseProjectType', () => {
  it('accepts only the data-model values', () => {
    expect(parseProjectType('corporate')).toBe('corporate');
    expect(parseProjectType('residential')).toBe('residential');
    expect(parseProjectType('hotel')).toBeUndefined();
    expect(parseProjectType(undefined)).toBeUndefined();
  });
});
