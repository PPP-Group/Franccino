import { useLocale, useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductDetail } from '@/lib/api/types';
import { toProductCard } from '@/lib/catalog/card';
import { primaryDimension } from '@/lib/catalog/technical';
import { formatDimension } from '@/lib/format/dimensions';
import { morphName, morphTypes } from '@/lib/ui/morph';
import { sectionClass, type Tone } from './tone';

/**
 * Primeira peça em destaque da API, com fatos que ela mesma traz (nada escrito à mão). A foto leva à página da peça
 * e abre como cortina ao entrar na tela; na rolagem, a foto anda um pouco mais devagar e o texto um pouco mais rápido
 * que a página (paralaxe, ideia 04, motion.css). O hover aproxima a foto pelo quadro interno (`.feature__frame`).
 */
export function FeatureSection({ product, tone = 'paper' }: { product: ProductDetail; tone?: Tone }) {
  const t = useTranslations('home.feature');
  const tDimensions = useTranslations('dimensions');
  const locale = useLocale() as Locale;
  // A foto cresce até a página da peça (ideia 10); nome próprio, porque a mesma peça pode estar numa esteira da home.
  const morph = morphName('feature', product.slug);
  const morphLink = product.cover ? { transitionTypes: morphTypes(morph), 'data-morph-link': morph } : {};
  const dimension = primaryDimension(product.dimensions);
  const dimensionLabels = {
    width: tDimensions('width'),
    depth: tDimensions('depth'),
    height: tDimensions('height'),
    seatHeight: tDimensions('seatHeight'),
    diameter: tDimensions('diameter'),
  };
  return (
    <section className={sectionClass(tone, 'feature')} aria-labelledby="feature-title">
      <div className="wrap feature__grid" data-parallax="">
        {product.cover ? (
          <Link
            className="feature__media"
            href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
            {...morphLink}
            tabIndex={-1}
            aria-hidden="true"
            data-reveal="curtain"
          >
            <span className="feature__frame" data-parallax-layer="back">
              <MorphImage
                name={morph}
                image={product.cover}
                sizes="(max-width: 56.25rem) 92vw, (max-width: 97.5rem) 52vw, 800px"
                fit="contain"
              />
            </span>
          </Link>
        ) : null}
        <div className="feature__copy" data-parallax-layer="front" data-reveal="">
          <div className="feature__head">
            <h2 id="feature-title" className="display">
              {product.name}
            </h2>
            {product.tagline ? <p className="lead">{product.tagline}</p> : null}
          </div>
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
            <Link
              className="btn"
              href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
              {...morphLink}
            >
              {t('view')}
            </Link>
            <QuickAddButton product={toProductCard(product)} variant="button" />
          </div>
        </div>
      </div>
    </section>
  );
}
