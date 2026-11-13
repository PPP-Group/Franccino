import { describe, expect, it } from 'vitest';
import { countAt, easeOutCubic, formatCountable, parseCountable } from './count-up';

describe('parseCountable', () => {
  it('separates prefix, number and suffix', () => {
    expect(parseCountable('+40 designers')).toMatchObject({ prefix: '+', value: 40, suffix: ' designers' });
    expect(parseCountable('25 anos')).toMatchObject({ prefix: '', value: 25, suffix: ' anos' });
  });

  it('reads thousands and decimal separators the way they were typed', () => {
    expect(parseCountable('12.000 m²')).toMatchObject({ value: 12000, thousands: '.', suffix: ' m²' });
    expect(parseCountable('1,5 mil')).toMatchObject({ value: 1.5, decimals: 1, decimal: ',' });
    expect(parseCountable('100%')).toMatchObject({ value: 100, suffix: '%' });
  });

  it('leaves text without a number and a bare year alone', () => {
    expect(parseCountable('Cláudio (MG)')).toBeNull();
    expect(parseCountable('2000')).toBeNull();
    expect(parseCountable('desde 2000 e 2021')).toBeNull();
  });
});

describe('formatCountable', () => {
  it('rebuilds the original format for any value', () => {
    const area = parseCountable('12.000 m²')!;
    expect(formatCountable(area, 0)).toBe('0 m²');
    expect(formatCountable(area, 4321.7)).toBe('4.322 m²');
    expect(formatCountable(area, 12000)).toBe('12.000 m²');
    const decimal = parseCountable('1,5 mil')!;
    expect(formatCountable(decimal, 0.75)).toBe('0,8 mil');
  });
});

describe('countAt', () => {
  it('starts at zero and lands exactly on the typed value', () => {
    const years = parseCountable('+25 anos')!;
    expect(countAt(years, 0)).toBe('+0 anos');
    expect(countAt(years, 1)).toBe('+25 anos');
    expect(countAt(years, 2)).toBe('+25 anos');
  });

  it('eases out', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(-1)).toBe(0);
  });
});
