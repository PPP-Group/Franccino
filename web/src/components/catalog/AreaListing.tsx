/**
 * Category tiles for an area page (`/indoor`, `/outdoor`), linking into
 * `/indoor/[category]` or `/outdoor/[category]`.
 */

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AreaRef, CategoryRef, Image } from '@/lib/api/types';
import { ApiImage } from '@/components/media/ApiImage';

type AreaListingProps = {
  area: AreaRef;
  categories: (CategoryRef & { cover: Image | null; product_count: number })[];
};

const AREA_HREF = {
  indoor: '/indoor/[category]',
  outdoor: '/outdoor/[category]',
} as const;

export async function AreaListing({ area, categories }: AreaListingProps) {
  const t = await getTranslations('catalog');

  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label={t('categoriesHeading')}>
      <h2>{t('categoriesHeading')}</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={{ pathname: AREA_HREF[area.key], params: { category: category.slug } }}>
              <ApiImage image={category.cover} sizes="(min-width: 768px) 25vw, 50vw" />
              <span>{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
