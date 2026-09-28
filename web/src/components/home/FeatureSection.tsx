import { useLocale, useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductDetail } from '@/lib/api/types';
import { toProductCard } from '@/lib/catalog/card';
import { primaryDimension } from '@/lib/catalog/technical';
import { formatDimension } from '@/lib/format/dimensions';

/** Primeira peça em destaque da API, com fatos que ela mesma traz (nada escrito à mão). */
export function FeatureSection({ product }: { product: ProductDetail }) {
  const t = useTranslations('home.feature');
  const tDimensions = useTranslations('dimensions');
  const locale = useLocale() as Locale;
  const dimension = primaryDimension(product.dimensions);
  const dimensionLabels = {
    width: tDimensions('width'),
    depth: tDimensions('depth'),
    height: tDimensions('height'),
    seatHeight: tDimensions('seatHeight'),
    diameter: tDimensions('diameter'),
  };
  return (
    <section className="feature" aria-labelledby="feature-title">
      <div className="wrap feature__grid">
        <div className="feature__media">
          {product.cover ? (
            <ApiImage image={product.cover} sizes="(max-width: 56.25rem) 100vw, 58vw" />
          ) : null}
        </div>
        <div className="feature__copy">
          <h2 id="feature-title" className="display">
            {product.name}
          </h2>
          {product.tagline ? <p className="lead">{product.tagline}</p> : null}
          <dl className="facts num">
            {dimension ? (
              <div>
                <dt>{t('dimensions')}</dt>
                <dd>{formatDimension(dimension, locale, dimensionLabels)}</dd>
              </div>
            ) : null}
            {product.materials ? (
              <div>
                <dt>{t('materials')}</dt>
                <dd>{product.materials}</dd>
              </div>
            ) : null}
            {product.designer ? (
              <div>
                <dt>{t('designer')}</dt>
                <dd>{product.designer.name}</dd>
              </div>
            ) : null}
          </dl>
          <div className="hero__actions">
            <Link className="btn" href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
              {t('view')}
            </Link>
            <QuickAddButton product={toProductCard(product)} variant="button" />
          </div>
        </div>
      </div>
    </section>
  );
}
