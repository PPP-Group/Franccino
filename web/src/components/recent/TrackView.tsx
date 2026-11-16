'use client';

import { useEffect } from 'react';
import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { recordRecent } from '@/lib/recent/store';

/** Guarda a peça aberta em "Peças que você viu", com o endereço dela em cada idioma. Não desenha nada. */
export function TrackView({
  product,
  locale,
  slugs,
}: {
  product: ProductCard;
  locale: Locale;
  slugs: Partial<Record<Locale, string | null>>;
}) {
  useEffect(() => {
    recordRecent(product, locale, slugs);
  }, [product, locale, slugs]);
  return null;
}
