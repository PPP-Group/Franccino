import { describe, expect, it } from 'vitest';
import { formatCentimeters, formatDimension } from './dimensions';

const base = { label: null, width: 600, depth: 600, height: 750, seat_height: null, diameter: null };

describe('formatDimension', () => {
  it('formats portuguese', () => {
    expect(formatDimension(base, 'pt')).toBe('L 60 × P 60 × A 75 cm');
  });

  it('formats english', () => {
    expect(formatDimension(base, 'en')).toBe('W 60 × D 60 × H 75 cm');
  });

  it('keeps one decimal with the locale separator', () => {
    expect(formatDimension({ ...base, width: 605 }, 'pt')).toBe('L 60,5 × P 60 × A 75 cm');
    expect(formatDimension({ ...base, width: 605 }, 'en')).toBe('W 60.5 × D 60 × H 75 cm');
  });

  it('adds seat height and diameter and skips nulls', () => {
    expect(formatDimension({ ...base, depth: null, seat_height: 420 }, 'pt')).toBe(
      'L 60 × A 75 cm · Assento 42 cm',
    );
    expect(formatDimension({ ...base, width: null, depth: null, diameter: 1200, height: 740 }, 'en')).toBe(
      'Ø 120 × H 74 cm',
    );
  });

  it('places diameter before width/depth/height when both are present', () => {
    expect(formatDimension({ ...base, diameter: 1200, depth: null }, 'pt')).toBe('Ø 120 × L 60 × A 75 cm');
  });

  it('returns empty for no values', () => {
    expect(
      formatDimension(
        { label: null, width: null, depth: null, height: null, seat_height: null, diameter: null },
        'pt',
      ),
    ).toBe('');
  });
});

describe('formatCentimeters', () => {
  it('converts millimetres with the locale separator', () => {
    expect(formatCentimeters(605, 'pt')).toBe('60,5');
    expect(formatCentimeters(605, 'en')).toBe('60.5');
    expect(formatCentimeters(5200, 'pt')).toBe('520');
  });
});
