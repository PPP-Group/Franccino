import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './config';

/**
 * Public pathnames for each internal route. Internal route folders under
 * `src/app/[locale]/...` stay in English; this map translates the public
 * URLs. Keys without a per-locale variant use the same path in every locale.
 */
export const pathnames = {
  '/': '/',
  '/indoor': '/indoor',
  '/indoor/[category]': '/indoor/[category]',
  '/outdoor': '/outdoor',
  '/outdoor/[category]': '/outdoor/[category]',
  '/products': { pt: '/produtos', en: '/products' },
  '/products/[slug]': { pt: '/produtos/[slug]', en: '/products/[slug]' },
  '/launches': { pt: '/lancamentos', en: '/novelties' },
  '/launches/[slug]': { pt: '/lancamentos/[slug]', en: '/novelties/[slug]' },
  '/collections': { pt: '/colecoes', en: '/collections' },
  '/collections/[slug]': { pt: '/colecoes/[slug]', en: '/collections/[slug]' },
  '/designers': '/designers',
  '/designers/[slug]': '/designers/[slug]',
  '/projects': { pt: '/projetos', en: '/projects' },
  '/projects/[slug]': { pt: '/projetos/[slug]', en: '/projects/[slug]' },
  '/corporate': { pt: '/corporativo', en: '/contract' },
  '/factory': { pt: '/fabrica', en: '/factory' },
  '/finishes': { pt: '/acabamentos', en: '/finishes' },
  '/downloads': '/downloads',
  '/stores': { pt: '/lojas', en: '/stores' },
  '/contact': { pt: '/contato', en: '/contact' },
  '/search': { pt: '/busca', en: '/search' },
  '/privacy': { pt: '/privacidade', en: '/privacy' },
  '/terms': { pt: '/termos', en: '/terms' },
  '/site-map': { pt: '/mapa-do-site', en: '/site-map' },
  '/quote-list': { pt: '/lista-de-orcamento', en: '/quote-list' },
  '/room-planner': { pt: '/sala-para-montar', en: '/room-planner' },
} as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});
