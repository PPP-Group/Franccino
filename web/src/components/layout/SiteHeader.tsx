import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Header menu, in the fixed order the product spec asks for. */
const NAV_ITEMS = [
  { href: '/indoor', key: 'indoor' },
  { href: '/outdoor', key: 'outdoor' },
  { href: '/launches', key: 'launches' },
  { href: '/collections', key: 'collections' },
  { href: '/designers', key: 'designers' },
  { href: '/corporate', key: 'corporate' },
  { href: '/factory', key: 'factory' },
  { href: '/stores', key: 'stores' },
  { href: '/contact', key: 'contact' },
  { href: '/downloads', key: 'blocks3d' },
] as const;

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const tCommon = await getTranslations('common');

  return (
    <header>
      <a href="#main-content">{tCommon('skipToContent')}</a>
      <Link href="/">{tCommon('siteName')}</Link>
      <nav aria-label={tCommon('mainNavigation')}>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{t(item.key)}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
