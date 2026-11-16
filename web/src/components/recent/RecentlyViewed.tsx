'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import type { Locale } from '@/i18n/config';
import { ProductRail } from '@/components/products/ProductRail';
import { refreshRecentProductCovers } from '@/lib/covers/fresh';
import { localizeRecent, useRecentProducts } from '@/lib/recent/store';

/**
 * "Peças que você viu", no fim das páginas, para a navegação continuar sem voltar à home. Some quando há menos de duas
 * peças além das que a própria página já mostra (`excludeIds`), e não aparece no HTML do servidor.
 */
export function RecentlyViewed({ excludeIds = [] }: { excludeIds?: number[] }) {
  const t = useTranslations('recent');
  const locale = useLocale() as Locale;
  // A capa guardada pode ter sido trocada no catálogo (e o arquivo antigo, apagado).
  useEffect(() => {
    void refreshRecentProductCovers();
  }, []);
  // O endereço e o nome de cada peça no idioma da página (no `/en`, o link em português dava erro).
  const products = localizeRecent(useRecentProducts(), locale).filter(
    (item) => !excludeIds.includes(item.id),
  );
  if (products.length < 2) {
    return null;
  }
  return (
    <section className="section recent" aria-labelledby="recent-title">
      <div className="wrap" data-reveal>
        <div className="section-head">
          <h2 id="recent-title">{t('title')}</h2>
        </div>
        <ProductRail label={t('title')} products={products} scope="recent" />
      </div>
    </section>
  );
}
