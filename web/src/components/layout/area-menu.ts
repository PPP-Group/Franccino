import type { AreaDetail } from '@/lib/api/catalog';

export type AreaMenuKey = 'indoor' | 'outdoor';
export type AreaMenuCategory = { slug: string; name: string };
export type AreaMenus = Record<AreaMenuKey, AreaMenuCategory[]>;

/**
 * Categorias do painel de Casa e Giardini no menu do topo (ajustes do cliente, 06/10/2026: as categorias
 * saem do meio da página e vão para o menu, "no estilo da Saccaro"). Só entram categorias com peças;
 * sem a área na API, o item fica sem painel e continua sendo um link comum.
 */
export function areaMenus(indoor: AreaDetail | null, outdoor: AreaDetail | null): AreaMenus {
  return { indoor: categoriesOf(indoor), outdoor: categoriesOf(outdoor) };
}

function categoriesOf(area: AreaDetail | null): AreaMenuCategory[] {
  return (area?.categories ?? [])
    .filter((category) => category.product_count > 0)
    .map((category) => ({ slug: category.slug, name: category.name }));
}
