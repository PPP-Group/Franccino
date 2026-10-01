import { describe, expect, it } from 'vitest';
import type { Store } from '@/lib/api/types';
import { renderWithIntl } from '@/test/intl';
import { StoreFinder } from './StoreFinder';

const store = (overrides: Partial<Store>): Store => ({
  id: 1,
  name: 'Franccino Lourdes',
  type: 'exclusive',
  address: 'Rua Marília de Dirceu, 204',
  address_complement: null,
  district: 'Lourdes',
  city: 'Belo Horizonte',
  state: 'MG',
  postal_code: null,
  country: 'BR',
  latitude: null,
  longitude: null,
  phone: '(31) 99746-9821',
  whatsapp: null,
  email: null,
  website_url: null,
  instagram_url: null,
  opening_hours: null,
  ...overrides,
});

describe('StoreFinder', () => {
  it('shows the stores of the first state and marks its chip', () => {
    const html = renderWithIntl(
      <StoreFinder
        stores={[
          store({}),
          store({ id: 2, name: 'Grupo Robusti', type: 'reseller', city: 'Ribeirão Preto', state: 'SP' }),
        ]}
        states={['MG', 'SP']}
      />,
    );
    expect(html).toContain('Franccino Lourdes');
    expect(html).not.toContain('Grupo Robusti');
    expect(html).toContain('aria-pressed="true">MG</button>');
    expect(html).toContain('href="tel:+5531997469821"');
    expect(html).toContain('Loja exclusiva');
  });

  it('starts with every state and shows contact details on the stores page', () => {
    const html = renderWithIntl(
      <StoreFinder
        stores={[
          store({
            whatsapp: '5531997469821',
            email: 'bh@franccino.com.br',
            opening_hours: 'Seg a sex, 9h às 18h',
          }),
          store({ id: 2, name: 'Grupo Robusti', type: 'reseller', state: 'SP' }),
        ]}
        states={['MG', 'SP']}
        allStates
        typeFilter
        detailed
      />,
    );
    expect(html).toContain('Franccino Lourdes');
    expect(html).toContain('Grupo Robusti');
    expect(html).toContain('aria-pressed="true">Todos os estados</button>');
    expect(html).toContain('>Revenda</button>');
    expect(html).toContain('href="https://wa.me/5531997469821"');
    expect(html).toContain('href="mailto:bh@franccino.com.br"');
    expect(html).toContain('https://www.google.com/maps/search/?api=1&amp;query=');
    expect(html).toContain('Seg a sex, 9h às 18h');
  });
});
