'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { activeNavKey, NAV_ITEMS } from './nav';
import { QuoteListLink } from './QuoteListLink';

export function HeaderNav() {
  const t = useTranslations('header');
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const active = activeNavKey(pathname);

  // O botão fica depois do <nav> no DOM (dentro de `.tools`, ao lado da busca
  // e do idioma) — mover o <nav> para antes dele mudaria a grade de 3
  // colunas do cabeçalho (`site-header__bar`) e a seleção `.tools
  // .menu-toggle` do CSS. Em vez de reordenar o DOM, o Esc é ouvido no
  // `document` (funciona mesmo com o foco ainda no botão que abriu o menu) e
  // a abertura leva o foco para o primeiro link do menu.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    navRef.current?.querySelector('a')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <nav ref={navRef} id="site-nav" className={open ? 'nav is-open' : 'nav'} aria-label={t('navLabel')}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {nav(item.key)}
          </Link>
        ))}
      </nav>
      <div className="tools">
        <Link href="/search" aria-label={t('search')}>
          <Icon name="search" />
        </Link>
        <LanguageSwitcher />
        <QuoteListLink />
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-controls="site-nav"
          aria-expanded={open}
          aria-label={open ? t('closeMenu') : t('openMenu')}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </>
  );
}
