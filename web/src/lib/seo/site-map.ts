import type { AppHref } from '@/i18n/navigation';

/**
 * Páginas fixas do mapa do site (Anexo I: página "Mapa do site"), na ordem do menu e do rodapé.
 * O rótulo vem de `nav.<key>` (ou `footer.<key>` para as páginas legais); a lista de orçamento fica
 * de fora, como no sitemap.xml (`noindex`).
 */
export const SITE_MAP_PAGES = [
  { key: 'home', namespace: 'siteMap', href: '/' },
  { key: 'indoor', namespace: 'nav', href: '/indoor' },
  { key: 'outdoor', namespace: 'nav', href: '/outdoor' },
  { key: 'products', namespace: 'nav', href: '/products' },
  { key: 'launches', namespace: 'nav', href: '/launches' },
  { key: 'collections', namespace: 'nav', href: '/collections' },
  { key: 'designers', namespace: 'nav', href: '/designers' },
  { key: 'projects', namespace: 'nav', href: '/projects' },
  { key: 'corporate', namespace: 'nav', href: '/corporate' },
  { key: 'factory', namespace: 'nav', href: '/factory' },
  { key: 'finishes', namespace: 'nav', href: '/finishes' },
  { key: 'stores', namespace: 'nav', href: '/stores' },
  { key: 'downloads', namespace: 'nav', href: '/downloads' },
  { key: 'planner', namespace: 'nav', href: '/room-planner' },
  { key: 'contact', namespace: 'nav', href: '/contact' },
  { key: 'privacy', namespace: 'footer', href: '/privacy' },
  { key: 'terms', namespace: 'footer', href: '/terms' },
  { key: 'cookies', namespace: 'footer', href: '/cookies' },
] as const satisfies { key: string; namespace: 'nav' | 'footer' | 'siteMap'; href: AppHref }[];
