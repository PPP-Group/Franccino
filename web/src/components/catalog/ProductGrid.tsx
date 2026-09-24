/**
 * Product card grid, shared by every listing that shows `ProductCard`s
 * (`/products`, `/indoor`, `/outdoor` and their category routes, plus the
 * "related products" sections on detail pages). Optionally renders
 * previous/next pagination links built with `listingQueryString`.
 */

import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getPathname, Link } from '@/i18n/navigation';
import type { ProductListParams } from '@/lib/api/catalog';
import { listingQueryString } from '@/lib/api/listing-params';
import type { Paginated, ProductCard } from '@/lib/api/types';
import type { Href } from '@/lib/seo/metadata';
import { ApiImage } from '@/components/media/ApiImage';

type ProductGridProps = {
  products: ProductCard[];
  pagination?: {
    meta: Paginated<ProductCard>['meta'];
    href: Href;
    params: ProductListParams;
  };
};

export async function ProductGrid({ products, pagination }: ProductGridProps) {
  const t = await getTranslations('catalog');
  const locale = (await getLocale()) as Locale;

  if (products.length === 0) {
    return <p>{t('empty')}</p>;
  }

  const pageHref = pagination ? getPathname({ href: pagination.href, locale }) : null;

  return (
    <>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
              <ApiImage image={product.cover} sizes="(min-width: 768px) 25vw, 50vw" />
              <span>{product.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {pagination && pageHref && pagination.meta.last_page > 1 && (
        <nav aria-label={t('pagination.label')}>
          {pagination.meta.current_page > 1 && (
            <a
              href={`${pageHref}${listingQueryString({ ...pagination.params, page: pagination.meta.current_page - 1 })}`}
            >
              {t('pagination.previous')}
            </a>
          )}
          {pagination.meta.current_page < pagination.meta.last_page && (
            <a
              href={`${pageHref}${listingQueryString({ ...pagination.params, page: pagination.meta.current_page + 1 })}`}
            >
              {t('pagination.next')}
            </a>
          )}
        </nav>
      )}
    </>
  );
}
