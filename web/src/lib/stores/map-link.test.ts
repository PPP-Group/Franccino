import { describe, expect, it } from 'vitest';
import { mapSearchUrl } from './map-link';

const base = {
  name: 'Franccino Lourdes',
  address: 'Rua Marília de Dirceu, 204',
  city: 'Belo Horizonte',
  state: 'MG',
};

describe('mapSearchUrl', () => {
  it('searches by the store name and address, which opens its Google listing', () => {
    expect(mapSearchUrl(base)).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Franccino Lourdes, Rua Marília de Dirceu, 204, Belo Horizonte, MG'),
    );
  });

  it('skips empty parts of the address', () => {
    expect(mapSearchUrl({ ...base, address: '' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Franccino Lourdes, Belo Horizonte, MG'),
    );
  });
});
