/**
 * Schema.org JSON-LD builders. Plain objects — rendering into a `<script>`
 * tag is `<JsonLd>`'s job (`web/src/components/seo/JsonLd.tsx`).
 */

import type { ProductDetail, Settings } from '@/lib/api/types';

const SITE_NAME = 'Franccino';

export function organizationJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
    ...(settings.social_links.length > 0 ? { sameAs: settings.social_links.map((link) => link.url) } : {}),
  };
}

export function productJsonLd(product: ProductDetail, url: string) {
  const images =
    product.gallery.length > 0
      ? product.gallery.map((image) => image.src)
      : product.cover
        ? [product.cover.src]
        : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url,
    image: images,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.tagline ? { description: product.tagline } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
