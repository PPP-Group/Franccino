import type { Image, ProductCard, ProductDetail } from '@/lib/api/types';

export function image(overrides: Partial<Image> = {}): Image {
  return {
    id: 1,
    alt: 'Cadeira Aura em fundo branco',
    width: 1600,
    height: 1200,
    src: 'https://cdn.test/aura-1600.webp',
    srcset: [
      { width: 480, url: 'https://cdn.test/aura-480.webp' },
      { width: 960, url: 'https://cdn.test/aura-960.webp' },
      { width: 1600, url: 'https://cdn.test/aura-1600.webp' },
    ],
    blur_data_url: null,
    ...overrides,
  };
}

export function productCard(overrides: Partial<ProductCard> = {}): ProductCard {
  return {
    id: 12,
    slug: 'cadeira-aura',
    name: 'Cadeira Aura',
    area: { key: 'indoor', name: 'Indoor', brand_name: 'Franccino Casa' },
    category: { id: 3, slug: 'cadeiras', name: 'Cadeiras', singular_name: 'Cadeira' },
    designer: { id: 5, slug: 'daniela-ferro', name: 'Daniela Ferro' },
    cover: image(),
    is_new: true,
    ...overrides,
  };
}

export function productDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    ...productCard(),
    slugs: { pt: 'cadeira-aura', en: 'aura-chair' },
    sku: 'CA-01',
    tagline: null,
    description: null,
    line: null,
    collections: [],
    dimensions: [{ label: null, width: 520, depth: 560, height: 800, seat_height: 460, diameter: null }],
    materials: null,
    finishes_note: null,
    finishes: [
      {
        group: 'Madeira',
        items: [
          { id: 101, name: 'Nogueira', code: 'MD-05', swatch: null },
          { id: 102, name: 'Freijó', code: 'MD-02', swatch: null },
        ],
      },
      { group: 'Tecido', items: [{ id: 201, name: 'Linho cru', code: 'TC-110', swatch: null }] },
    ],
    gallery: [],
    model_3d: null,
    files: [],
    line_products: [],
    related: [],
    seo: { title: null, description: null, image: null },
    locale_fallback: false,
    ...overrides,
  };
}
