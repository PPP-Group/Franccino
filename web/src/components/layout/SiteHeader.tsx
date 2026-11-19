import { useLocale, useTranslations } from 'next-intl';
import type { Settings } from '@/lib/api/types';
import type { NavMenus, NavTabImages } from './area-menu';
import { HeaderSocial } from './HeaderSocial';
import { Logo } from './Logo';
import { HeaderNav } from './HeaderNav';

/**
 * Cabeçalho do site. Sobre um banner de tela cheia (`.hero--full`), começa transparente e fica branco ao passar o
 * mouse, com menu ou busca abertos, ou depois de rolar a página (chrome.css, `data-scrolled` vem do `BootScript`).
 */
export function SiteHeader({
  menus,
  tabImages,
  settings,
}: {
  menus: NavMenus;
  tabImages: NavTabImages;
  settings: Settings;
}) {
  const t = useTranslations('header');
  const locale = useLocale();
  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        {/*
          A logo recarrega a página inicial e abre no topo, sempre (retorno de 09/11/2026): link comum, fora da navegação
          do roteador, sem a foto que volta nem a rolagem guardada.
        */}
        {}
        <a className="wordmark" href={`/${locale}`} aria-label={t('homeLabel')} data-no-motion="">
          <Logo />
        </a>
        <HeaderNav
          menus={menus}
          tabImages={tabImages}
          social={<HeaderSocial settings={settings} />}
          socialInMenu={<HeaderSocial settings={settings} className="header-social header-social--menu" />}
        />
      </div>
    </header>
  );
}
