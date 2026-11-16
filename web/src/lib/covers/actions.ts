'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getProduct } from '@/lib/api/catalog';
import type { Image } from '@/lib/api/types';

/** Mais que isso numa chamada não vem do site (a lista de desejos tem até 50 peças; as vistas, 12). */
const MAX_ENTRIES = 60;

export type CoverEntry = { slug: string; locale: string };

/**
 * A capa atual de cada peça guardada no navegador (lista de desejos e "Peças que você viu"), pelo id da peça
 * (retorno de 16/11/2026: as listas guardavam a capa de quando a peça entrou, e a troca de capa a deixava sem foto).
 * Peça que não existe mais fica de fora. Entrada do navegador: idioma e endereço são validados aqui; a resposta da API
 * vem do cache do site.
 */
export async function currentCovers(entries: unknown): Promise<Record<number, Image | null>> {
  if (!Array.isArray(entries)) return {};
  const clean = entries
    .filter(
      (entry): entry is CoverEntry =>
        !!entry &&
        typeof (entry as CoverEntry).slug === 'string' &&
        /^[a-z0-9-]{1,160}$/.test((entry as CoverEntry).slug) &&
        typeof (entry as CoverEntry).locale === 'string',
    )
    .slice(0, MAX_ENTRIES);
  const found = await Promise.all(
    clean.map((entry) =>
      getProduct(
        hasLocale(routing.locales, entry.locale) ? entry.locale : routing.defaultLocale,
        entry.slug,
      ).catch(() => null),
    ),
  );
  const covers: Record<number, Image | null> = {};
  for (const product of found) {
    if (product) covers[product.id] = product.cover;
  }
  return covers;
}
