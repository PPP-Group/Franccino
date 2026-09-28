import type { AppHref } from '@/i18n/navigation';

/** Ordem aprovada (conflito C7 do plano P4). Corporativo, Downloads e Contato ficam no rodapé. */
export const NAV_ITEMS = [
  { key: 'indoor', href: '/indoor' },
  { key: 'outdoor', href: '/outdoor' },
  { key: 'launches', href: '/launches' },
  { key: 'collections', href: '/collections' },
  { key: 'designers', href: '/designers' },
  { key: 'projects', href: '/projects' },
  { key: 'factory', href: '/factory' },
  { key: 'stores', href: '/stores' },
  { key: 'planner', href: '/room-planner' },
  { key: 'technical', href: { pathname: '/products', query: { view: 'table' } } },
] as const satisfies { key: string; href: AppHref }[];

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

const PREFIXES: [string, NavKey][] = [
  ['/indoor', 'indoor'],
  ['/outdoor', 'outdoor'],
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
