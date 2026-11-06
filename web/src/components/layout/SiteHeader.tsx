import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { NavMenus } from './area-menu';
import { Logo } from './Logo';
import { HeaderNav } from './HeaderNav';

/**
 * Cabeçalho do site. Sobre um banner de tela cheia (`.hero--full`), começa transparente e fica branco ao passar o
 * mouse, com menu ou busca abertos, ou depois de rolar a página (chrome.css, `data-scrolled` vem do `BootScript`).
 */
export function SiteHeader({ menus }: { menus: NavMenus }) {
  const t = useTranslations('header');
  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link className="wordmark" href="/" aria-label={t('homeLabel')}>
          <Logo />
        </Link>
        <HeaderNav menus={menus} />
      </div>
    </header>
  );
}
