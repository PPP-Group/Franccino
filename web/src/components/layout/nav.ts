import type { AppHref } from '@/i18n/navigation';

/**
 * Ordem aprovada (conflito C7 do plano P4). Corporativo, Downloads e Contato ficam no rodapé.
 * "Área técnica" saiu do menu (ajustes do cliente, 06/10/2026): o acesso é só pelo botão "Tabela técnica" do catálogo.
 */
/**
 * Revisão da Franccino (12/11/2026, item 5): Casa e Giardini viraram um item só, "Produtos", com as abas "Área interna"
 * e "Área externa" no painel; o clique em Produtos mostra as peças das duas linhas juntas.
 */
export const NAV_ITEMS = [
  { key: 'products', href: '/products' },
  { key: 'launches', href: '/launches' },
  { key: 'collections', href: '/collections' },
  { key: 'designers', href: '/designers' },
  { key: 'projects', href: '/projects' },
  { key: 'factory', href: '/factory' },
  { key: 'stores', href: '/stores' },
  { key: 'planner', href: '/room-planner' },
] as const satisfies { key: string; href: AppHref }[];

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

const PREFIXES: [string, NavKey][] = [
  ['/products', 'products'],
  ['/indoor', 'products'],
  ['/outdoor', 'products'],
  ['/launches', 'launches'],
  ['/collections', 'collections'],
  ['/designers', 'designers'],
  ['/projects', 'projects'],
  ['/factory', 'factory'],
  ['/stores', 'stores'],
  ['/room-planner', 'planner'],
];

/** Recebe o pathname interno do next-intl (ex.: `/indoor/[category]`). */
export function activeNavKey(pathname: string): NavKey | null {
  for (const [prefix, key] of PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return key;
    }
  }
  return null;
}
