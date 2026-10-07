'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link, usePathname } from '@/i18n/navigation';
import type { AreaMenuKey, AreaMenus } from './area-menu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { activeNavKey, NAV_ITEMS } from './nav';
import { QuoteListLink } from './QuoteListLink';

// Mesmo corte do menu recolhido em `styles/chrome.css` (`@media (max-width: 1180px)`).
const COLLAPSED_NAV_QUERY = '(max-width: 1180px)';

function isAreaKey(key: string): key is AreaMenuKey {
  return key === 'indoor' || key === 'outdoor';
}

function categoryHref(area: AreaMenuKey, category: string) {
  return area === 'outdoor'
    ? ({ pathname: '/outdoor/[category]', params: { category } } as const)
    : ({ pathname: '/indoor/[category]', params: { category } } as const);
}

export function HeaderNav({ menus }: { menus: AreaMenus }) {
  const t = useTranslations('header');
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Painel de categorias aberto (Casa ou Giardini). No desktop abre no clique e ao passar o mouse; no menu
  // recolhido funciona como sanfona dentro da lista.
  const [panel, setPanel] = useState<AreaMenuKey | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  // Quando o mouse acabou de abrir o painel, o clique que vem em seguida não deve fechá-lo.
  const hoverOpenedAt = useRef(0);
  const active = activeNavKey(pathname);

  // Trocar de página fecha o menu e o painel.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
    setPanel(null);
  }

  // O botão fica depois do <nav> no DOM (dentro de `.tools`, ao lado da busca
  // e do idioma) — mover o <nav> para antes dele mudaria a grade de 3
  // colunas do cabeçalho (`site-header__bar`) e a seleção `.tools
  // .menu-toggle` do CSS. Em vez de reordenar o DOM, o Esc é ouvido no
  // `document` (funciona mesmo com o foco ainda no botão que abriu o menu) e
  // a abertura leva o foco para o primeiro link do menu. Com o painel de
  // categorias aberto, o Esc fecha só o painel e devolve o foco a Casa/Giardini.
  useEffect(() => {
    if (!open && !panel) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }
      if (panel) {
        const trigger = navRef.current?.querySelector<HTMLButtonElement>(`[data-panel-trigger="${panel}"]`);
        setPanel(null);
        trigger?.focus();
        return;
      }
      setOpen(false);
      toggleRef.current?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, panel]);

  // Clique fora do cabeçalho fecha o painel de categorias.
  useEffect(() => {
    if (!panel) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      const header = navRef.current?.closest('.site-header');
      if (header && event.target instanceof Node && !header.contains(event.target)) {
        setPanel(null);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [panel]);

  useEffect(() => {
    if (!open) {
      return;
    }
    navRef.current?.querySelector<HTMLElement>('a, button')?.focus();
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

  // Ao passar para a largura de desktop (girar o tablet, redimensionar) o botão
  // some; fechar o menu libera a rolagem que o bloqueio acima prendeu.
  useEffect(() => {
    if (!open) {
      return;
    }
    const collapsed = window.matchMedia(COLLAPSED_NAV_QUERY);
    function handleChange(event: MediaQueryListEvent) {
      if (!event.matches) {
        setOpen(false);
      }
    }
    collapsed.addEventListener('change', handleChange);
    return () => {
      collapsed.removeEventListener('change', handleChange);
    };
  }, [open]);

  // Passar o mouse abre o painel só no desktop; no menu recolhido ele abre no toque.
  function hoverOpen(key: AreaMenuKey, at: number) {
    if (!window.matchMedia(COLLAPSED_NAV_QUERY).matches) {
      hoverOpenedAt.current = at;
      setPanel(key);
    }
  }

  function toggleArea(key: AreaMenuKey, at: number) {
    if (panel === key && at - hoverOpenedAt.current < 600) {
      return;
    }
    setPanel((value) => (value === key ? null : key));
  }

  function hoverClose() {
    if (!window.matchMedia(COLLAPSED_NAV_QUERY).matches) {
      setPanel(null);
    }
  }

  return (
    <>
      <nav ref={navRef} id="site-nav" className={open ? 'nav is-open' : 'nav'} aria-label={t('navLabel')}>
        {NAV_ITEMS.map((item) => {
          const area = isAreaKey(item.key) ? item.key : null;
          const categories = area ? menus[area] : [];
          if (!area || categories.length === 0) {
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {nav(item.key)}
              </Link>
            );
          }
          const panelId = `nav-panel-${area}`;
          const expanded = panel === area;
          return (
            <div
              key={area}
              className={expanded ? 'nav-area is-open' : 'nav-area'}
              onMouseEnter={(event) => hoverOpen(area, event.timeStamp)}
              onMouseLeave={hoverClose}
            >
              <button
                type="button"
                className="nav-area__trigger"
                data-panel-trigger={area}
                data-active={area === active ? 'true' : undefined}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={(event) => toggleArea(area, event.timeStamp)}
              >
                {nav(area)}
                <Icon name="chevron" />
              </button>
              <div id={panelId} className="nav-panel" hidden={!expanded}>
                <div className="wrap nav-panel__inner">
                  <Link
                    className="nav-panel__all"
                    href={item.href}
                    aria-current={area === active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {t('areaAll', { area: nav(area) })}
                  </Link>
                  <ul className="nav-panel__list">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link href={categoryHref(area, category.slug)} onClick={() => setOpen(false)}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
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
