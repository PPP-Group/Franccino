import { getTranslations } from 'next-intl/server';
import { DownloadAllButton } from '@/components/downloads/DownloadAllButton';
import { FeatureCarousel } from '@/components/products/FeatureCarousel';
import type { Locale } from '@/i18n/config';
import { getProductDetails } from '@/lib/api/catalog';
import type { ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { carouselPieces, fitsFeatureCarousel } from '@/lib/ui/feature-carousel';
import { PiecesViews } from './PiecesViews';
import { ProductGrid } from './ProductGrid';
import { TechTable } from './TechTable';

/**
 * As peças de uma coleção, designer ou lançamento, sempre no mesmo formato (retorno de 09/11/2026). Com o carrossel da
 * ideia 01, embaixo dele vêm só os downloads das peças (revisão da Franccino, 18/11/2026: a grade repetia as fotos do
 * carrossel). Sem carrossel (poucas peças), a grade e os downloads com a barra do catálogo.
 */
export async function PiecesSection({
  id,
  title,
  locale,
  products,
  carousel = true,
  collectionSlug,
}: {
  id: string;
  title: string;
  locale: Locale;
  products: ProductCard[];
  carousel?: boolean;
  /** Na coleção: o botão de baixar todos os arquivos das peças num zip (18/11/2026). */
  collectionSlug?: string;
}) {
  if (products.length === 0) {
    return null;
  }
  const [t, details] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getProductDetails(
      locale,
      products.map((product) => product.slug),
    ),
  ]);
  return (
    <section aria-labelledby={id} className="page-section">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {carousel && fitsFeatureCarousel(products.length) ? (
        <>
          <FeatureCarousel label={title} products={carouselPieces(products)} />
          <h3 className="pieces-downloads__title">{t('table.label')}</h3>
          <TechTable rows={details.map(toTechnicalRow)} />
          {collectionSlug && details.some((detail) => detail.files.length > 0) ? (
            <DownloadAllButton collectionSlug={collectionSlug} />
          ) : null}
        </>
      ) : (
        <PiecesViews
          count={t('count', { count: products.length })}
          grid={<ProductGrid lead products={products} priorityCount={3} />}
          table={<TechTable rows={details.map(toTechnicalRow)} />}
        />
      )}
    </section>
  );
}
