'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
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
  const active = activeNavKey(pathname);

  return (
    <>
      <nav
        id="site-nav"
        className={open ? 'nav is-open' : 'nav'}
        aria-label={t('navLabel')}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            setOpen(false);
            toggleRef.current?.focus();
          }
        }}
      >
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
