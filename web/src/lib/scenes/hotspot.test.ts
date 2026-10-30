import { describe, expect, it } from 'vitest';
import { placeHotspot } from './hotspot';

describe('placeHotspot', () => {
  it('turns the panel percentages into CSS positions', () => {
    expect(placeHotspot(42.5, 61)).toMatchObject({ left: '42.5%', top: '61%' });
  });

  it('keeps the point inside the photo', () => {
    expect(placeHotspot(140, -3)).toMatchObject({ left: '100%', top: '0%' });
    expect(placeHotspot(Number.NaN, 20)).toMatchObject({ left: '50%' });
  });

  it('opens the card towards the middle of the photo', () => {
    expect(placeHotspot(20, 20)).toMatchObject({ horizontal: 'start', vertical: 'below' });
    expect(placeHotspot(80, 80)).toMatchObject({ horizontal: 'end', vertical: 'above' });
  });
});
