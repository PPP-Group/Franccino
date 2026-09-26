import { describe, expect, it } from 'vitest';
import { areaPath, areaTone } from './area';

describe('area helpers', () => {
  it('maps the api area key to the brand tone', () => {
    expect(areaTone('indoor')).toBe('casa');
    expect(areaTone('outdoor')).toBe('giardini');
  });

  it('maps the api area key to the internal route', () => {
    expect(areaPath('indoor')).toBe('/indoor');
    expect(areaPath('outdoor')).toBe('/outdoor');
  });
});
