import { describe, expect, it } from 'vitest';
import type { Store } from '@/lib/api/types';
import { storeWhatsapp, whatsappCities } from './whatsapp-cities';

const store = (overrides: Partial<Store>): Store =>
  ({
    id: 1,
    name: 'Loja',
    type: 'exclusive',
    city: 'São Paulo',
    state: 'SP',
    phone: null,
    whatsapp: null,
    ...overrides,
  }) as Store;

describe('storeWhatsapp', () => {
  it('uses the WhatsApp field first, then a mobile phone, never a landline', () => {
    expect(storeWhatsapp({ whatsapp: '51 3072-1883', phone: null })).toBe('555130721883');
    expect(storeWhatsapp({ whatsapp: null, phone: '41 9 9179 7019' })).toBe('5541991797019');
    expect(storeWhatsapp({ whatsapp: null, phone: '11 3062-0233' })).toBeNull();
    expect(storeWhatsapp({ whatsapp: null, phone: null })).toBeNull();
  });
});

describe('whatsappCities', () => {
  it('groups the stores with a number by city, in alphabetical order, exclusive stores first', () => {
    const cities = whatsappCities([
      store({
        id: 1,
        name: 'Revenda',
        type: 'reseller',
        city: 'Curitiba',
        state: 'PR',
        phone: '41 99999-0000',
      }),
      store({ id: 2, name: 'Franccino Curitiba', city: 'Curitiba', state: 'PR', phone: '41 9 9179 7019' }),
      store({ id: 3, name: 'Fixo', city: 'Bauru', state: 'SP', phone: '14 3206-5262' }),
      store({ id: 4, name: 'Franccino Brasília', city: 'Brasília', state: 'DF', whatsapp: '61 99999-1111' }),
    ]);
    expect(cities.map((city) => city.city)).toEqual(['Brasília', 'Curitiba']);
    expect(cities[1].stores.map((item) => item.name)).toEqual(['Franccino Curitiba', 'Revenda']);
  });
});
