'use client';

import { useTranslations } from 'next-intl';
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link, usePathname } from '@/i18n/navigation';
import type { AreaMenuKey, NavMenuKey, NavMenus } from './area-menu';
import { HeaderSearch } from './HeaderSearch';
import { LanguageSwitcher } from './LanguageSwitcher';
import { activeNavKey, NAV_ITEMS } from './nav';
import { QuoteListLink } from './QuoteListLink';

// Mesmo corte do menu recolhido em `styles/chrome.css` (`@media (max-width: 1180px)`).
const COLLAPSED_NAV_QUERY = '(max-width: 1180px)';
// Tempo para o mouse sair do item e chegar ao painel (ou voltar) sem o painel fechar no caminho.
const CLOSE_DELAY_MS = 250;

function isMenuKey(key: string): key is NavMenuKey {
  return key === 'indoor' || key === 'outdoor' || key === 'collections';
}

function isDesktop() {
  return !window.matchMedia(COLLAPSED_NAV_QUERY).matches;
}

function categoryHref(area: AreaMenuKey, category: string) {
  return area === 'outdoor'
    ? ({ pathname: '/outdoor/[category]', params: { category } } as const)
    : ({ pathname: '/indoor/[category]', params: { category } } as const);
}

function entryHref(menu: NavMenuKey, slug: string) {
  return menu === 'collections'
    ? ({ pathname: '/collections/[slug]', params: { slug } } as const)
    : categoryHref(menu, slug);
}

export function HeaderNav({ menus }: { menus: NavMenus }) {
  const t = useTranslations('header');
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Painel aberto (Casa, Giardini ou Coleções). No desktop abre no clique e ao passar o mouse; no menu recolhido
  // funciona como sanfona dentro da lista.
  const [panel, setPanel] = useState<NavMenuKey | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  // Aberto pelo clique (ou pelo teclado): fica aberto quando o mouse sai, até Esc, clique fora ou outro clique.
  const pinned = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const active = activeNavKey(pathname);

  function cancelClose() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function closePanel() {
    cancelClose();
    pinned.current = false;
    setPanel(null);
  }

  // Desmontar com o fechamento agendado: cancela o timer.
  useEffect(() => {
    const timer = closeTimer;
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

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
        pinned.current = false;
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
        pinned.current = false;
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

  // Passar o mouse abre o painel só no desktop e só com mouse (no toque, o clique abre). Sair fecha depois de um
  // instante, para o caminho do item até o painel (ou de volta) não fechar nada.
  function pointerOpen(key: NavMenuKey, event: ReactPointerEvent) {
    if (event.pointerType !== 'mouse' || !isDesktop()) {
      return;
    }
    cancelClose();
    if (panel !== key) {
      pinned.current = false;
      setPanel(key);
    }
  }

  function pointerLeave(event: ReactPointerEvent) {
    if (event.pointerType !== 'mouse' || !isDesktop() || pinned.current) {
      return;
    }
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setPanel(null);
    }, CLOSE_DELAY_MS);
  }

  // Clique: abre e fixa; no painel já aberto pelo mouse, fixa; no painel fixo, fecha.
  function clickTrigger(key: NavMenuKey) {
    cancelClose();
    if (panel === key && pinned.current) {
      closePanel();
      return;
    }
    pinned.current = true;
    setPanel(key);
  }

  return (
    <>
      <nav ref={navRef} id="site-nav" className={open ? 'nav is-open' : 'nav'} aria-label={t('navLabel')}>
        {NAV_ITEMS.map((item) => {
          const area = isMenuKey(item.key) ? item.key : null;
          const entries = area ? menus[area] : [];
          if (!area || entries.length === 0) {
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
              onPointerEnter={(event) => pointerOpen(area, event)}
              onPointerLeave={pointerLeave}
            >
              <button
                type="button"
                className="nav-area__trigger"
                data-panel-trigger={area}
                data-active={area === active ? 'true' : undefined}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => clickTrigger(area)}
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
                    {area === 'collections' ? t('collectionsAll') : t('areaAll', { area: nav(area) })}
                  </Link>
                  <ul className="nav-panel__list">
                    {entries.map((entry) => (
                      <li key={entry.slug}>
                        <Link href={entryHref(area, entry.slug)} onClick={() => setOpen(false)}>
                          {entry.name}
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
        <HeaderSearch />
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
