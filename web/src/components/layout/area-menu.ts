import type { AreaDetail } from '@/lib/api/catalog';
import type { CollectionCard } from '@/lib/api/types';

export type AreaMenuKey = 'indoor' | 'outdoor';
export type AreaMenuCategory = { slug: string; name: string };
export type AreaMenus = Record<AreaMenuKey, AreaMenuCategory[]>;
/** Painéis do menu do topo: Casa, Giardini e Coleções. */
export type NavMenuKey = AreaMenuKey | 'collections';
export type NavMenus = Record<NavMenuKey, AreaMenuCategory[]>;

/**
 * Categorias do painel de Casa e Giardini no menu do topo (ajustes do cliente, 06/10/2026: as categorias
 * saem do meio da página e vão para o menu, "no estilo da Saccaro"). Só entram categorias com peças;
 * sem a área na API, o item fica sem painel e continua sendo um link comum.
 */
export function areaMenus(indoor: AreaDetail | null, outdoor: AreaDetail | null): AreaMenus {
  return { indoor: categoriesOf(indoor), outdoor: categoriesOf(outdoor) };
}

/**
 * Painéis do menu com as coleções (rodada 3, 06/11/2026: "não vi nenhum submenu em Coleções"). Só coleções com
 * peças, na ordem da API; sem coleções, Coleções continua sendo um link comum.
 */
export function navMenus(
  indoor: AreaDetail | null,
  outdoor: AreaDetail | null,
  collections: CollectionCard[],
): NavMenus {
  return {
    ...areaMenus(indoor, outdoor),
    collections: collections
      .filter((collection) => collection.product_count > 0)
      .map((collection) => ({ slug: collection.slug, name: collection.name }))
      .sort(byName),
  };
}

/** Ordem alfabética no idioma da página (revisão da Franccino, 12/11/2026), sem depender da ordem do painel. */
const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

function categoriesOf(area: AreaDetail | null): AreaMenuCategory[] {
  return (area?.categories ?? [])
    .filter((category) => category.product_count > 0)
    .map((category) => ({ slug: category.slug, name: category.name }))
    .sort(byName);
}
