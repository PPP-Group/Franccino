import { describe, expect, it } from 'vitest';
import { JsonLd } from '@/components/seo/JsonLd';
import type { ProductDetail, Settings } from '@/lib/api/types';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { breadcrumbJsonLd, organizationJsonLd, productJsonLd } from './jsonld';

// `JsonLd` is a Server Component (a plain function), so calling it directly
// returns the React element it builds — see `ApiImage.test.ts` for the same
// pattern applied to another Server Component.

describe('JsonLd', () => {
  it('renders a script tag with the application/ld+json type', () => {
    const element = JsonLd({ data: { '@type': 'Thing' } });

    expect(element.type).toBe('script');
    expect(element.props.type).toBe('application/ld+json');
  });

  it('escapes "<" so the payload cannot close the script tag early', () => {
    const element = JsonLd({ data: { name: '</script><script>alert(1)</script>' } });
    const html = element.props.dangerouslySetInnerHTML.__html as string;

    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c');
  });
});

describe('organizationJsonLd', () => {
  const settings: Settings = {
    ...EMPTY_SETTINGS,
    company_name: 'Franccino',
    contact_email: 'contato@franccino.com.br',
    contact_phone: '+55 11 5555-0000',
    instagram_url: 'https://instagram.com/franccino',
  };

  it('describes Franccino as a schema.org Organization', () => {
    const jsonLd = organizationJsonLd(settings);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.name).toBe('Franccino');
    expect(jsonLd.sameAs).toEqual(['https://instagram.com/franccino']);
  });

  it('omits sameAs when there is no social link', () => {
    expect(organizationJsonLd(EMPTY_SETTINGS).sameAs).toBeUndefined();
  });
});

describe('productJsonLd', () => {
  it('has @type Product, a brand and images', () => {
    const product = buildProduct();

    const jsonLd = productJsonLd(product, 'https://franccino.com.br/pt/produtos/cadeira-aura');

    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('Cadeira Aura');
    expect(jsonLd.brand).toBeTruthy();
    expect(jsonLd.image).toEqual(['https://cdn.test/aura.jpg']);
  });
});

describe('breadcrumbJsonLd', () => {
  it('builds an ordered schema.org BreadcrumbList', () => {
    const jsonLd = breadcrumbJsonLd([
      { name: 'Produtos', url: 'https://franccino.com.br/pt/produtos' },
      { name: 'Cadeira Aura', url: 'https://franccino.com.br/pt/produtos/cadeira-aura' },
    ]);

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Produtos',
    });
  });
});

function buildProduct(): ProductDetail {
  return {
    id: 1,
    slug: 'cadeira-aura',
    name: 'Cadeira Aura',
    area: { key: 'indoor', name: 'Indoor', brand_name: 'Franccino' },
    category: { id: 1, slug: 'cadeiras', name: 'Cadeiras', singular_name: 'Cadeira' },
    designer: null,
    cover: null,
    is_new: false,
    slugs: { pt: 'cadeira-aura', en: 'aura-chair' },
    sku: null,
    tagline: null,
    description: null,
    line: null,
    collections: [],
    dimensions: [],
    materials: null,
    finishes_note: null,
    finishes: [],
    gallery: [
      {
        id: 1,
        alt: 'Cadeira Aura',
        width: 800,
        height: 600,
        src: 'https://cdn.test/aura.jpg',
        srcset: [],
        blur_data_url: null,
      },
    ],
    model_3d: null,
    files: [],
    line_products: [],
    related: [],
    seo: { title: null, description: null, image: null },
    locale_fallback: false,
  };
}
