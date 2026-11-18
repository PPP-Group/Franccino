import type { AreaDetail } from '@/lib/api/catalog';
import type { CollectionCard, Image } from '@/lib/api/types';

export type AreaMenuKey = 'indoor' | 'outdoor';
/** `image`: a capa que flutua ao lado do ponteiro no hover do item (retorno de 17/11/2026), como nos filtros. */
export type AreaMenuCategory = { slug: string; name: string; image: Image | null };
export type AreaMenus = Record<AreaMenuKey, AreaMenuCategory[]>;
/**
 * Painéis do menu do topo: Produtos (as duas linhas juntas) e Coleções. Casa e Giardini continuam como listas para as
 * abas "Área interna" e "Área externa" do painel de Produtos (revisão da Franccino, 12/11/2026, item 5).
 */
export type NavMenuKey = AreaMenuKey | 'products' | 'collections';
export type NavMenus = Record<NavMenuKey, AreaMenuCategory[]>;
/** Capas das abas do painel de Produtos (Área interna, Área externa e Acabamentos), para a foto do hover. */
export type NavTabImages = Record<AreaMenuKey | 'finishes', Image | null>;

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
  const areas = areaMenus(indoor, outdoor);
  return {
    ...areas,
    // Produtos: todas as categorias das duas linhas, uma vez cada (a mesma categoria existe nas duas).
    // A mesma categoria nas duas linhas fica com a primeira capa que tiver.
    products: [
      ...[...areas.indoor, ...areas.outdoor]
        .reduce((all, entry) => {
          const known = all.get(entry.slug);
          all.set(entry.slug, known ? { ...known, image: known.image ?? entry.image } : entry);
          return all;
        }, new Map<string, AreaMenuCategory>())
        .values(),
    ].sort(byName),
    collections: collections
      .filter((collection) => collection.product_count > 0)
      .map((collection) => ({ slug: collection.slug, name: collection.name, image: collection.cover }))
      .sort(byName),
  };
}

/** Ordem alfabética no idioma da página (revisão da Franccino, 12/11/2026), sem depender da ordem do painel. */
const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

function categoriesOf(area: AreaDetail | null): AreaMenuCategory[] {
  return (area?.categories ?? [])
    .filter((category) => category.product_count > 0)
    .map((category) => ({ slug: category.slug, name: category.name, image: category.cover }))
    .sort(byName);
}

/** Capas das abas do painel de Produtos: a capa de cada área e, em Acabamentos, a capa da página ou a 1ª amostra. */
export function navTabImages(
  indoor: AreaDetail | null,
  outdoor: AreaDetail | null,
  finishes: { cover: Image | null } | null,
  swatches: (Image | null)[],
): NavTabImages {
  return {
    indoor: indoor?.cover ?? null,
    outdoor: outdoor?.cover ?? null,
    finishes: finishes?.cover ?? swatches.find((swatch) => swatch !== null) ?? null,
  };
}
