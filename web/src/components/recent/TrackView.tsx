'use client';

import { useEffect } from 'react';
import type { ProductCard } from '@/lib/api/types';
import { recordRecent } from '@/lib/recent/store';

/** Guarda a peça aberta em "Peças que você viu". Não desenha nada. */
export function TrackView({ product }: { product: ProductCard }) {
  useEffect(() => {
    recordRecent(product);
  }, [product]);
  return null;
}
