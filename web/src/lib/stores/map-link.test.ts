import { describe, expect, it } from 'vitest';
import { mapSearchUrl } from './map-link';

const base = {
  name: 'Franccino Lourdes',
  address: 'Rua Marília de Dirceu, 204',
  city: 'Belo Horizonte',
  state: 'MG',
  country: 'BR',
};

describe('mapSearchUrl', () => {
  it('uses the coordinates when both exist', () => {
    expect(mapSearchUrl({ ...base, latitude: -19.93, longitude: -43.94 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=-19.93%2C-43.94',
    );
  });

  it('falls back to the full address', () => {
    expect(mapSearchUrl({ ...base, latitude: null, longitude: -43.94 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Franccino Lourdes, Rua Marília de Dirceu, 204, Belo Horizonte, MG, BR'),
    );
  });
});
