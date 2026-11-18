'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { RowPeek } from '@/components/catalog/RowPeek';
import { ApiImage } from '@/components/media/ApiImage';
import { MorphImage } from '@/components/media/MorphImage';
import { AreaDot } from '@/components/ui/AreaDot';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { formatDimension } from '@/lib/format/dimensions';
import { normalizeSuggestQuery, type Suggestion } from '@/lib/search/suggest';
import { morphName, morphTypes } from '@/lib/ui/morph';

const DEBOUNCE_MS = 250;
// Toque que anda mais que isso é rolagem da lista, não escolha.
const TAP_SLOP_PX = 10;
// Depois do toque que já navegou, o clique que o navegador ainda mandar não navega de novo.
const TAP_CLICK_MS = 1000;

function suggestionHref(item: Suggestion) {
  if (item.kind === 'designer') {
    return { pathname: '/designers/[slug]', params: { slug: item.slug } } as const;
  }
  if (item.kind === 'collection') {
    return { pathname: '/collections/[slug]', params: { slug: item.slug } } as const;
  }
  return { pathname: '/products/[slug]', params: { slug: item.slug } } as const;
}

/**
 * Busca do cabeçalho: abre uma faixa logo abaixo da barra (desce com fade), com o campo sublinhado como o da
 * newsletter, e mostra sugestões enquanto a pessoa digita. O painel fica sempre no HTML (`hidden` quando fechado),
 * para fechar também com transição (motion.css).
 */
export function HeaderSearch() {
  const t = useTranslations('header');
  const tSearch = useTranslations('search');
  const tTable = useTranslations('catalog.table');
  const tDimensions = useTranslations('dimensions');
  const locale = useLocale();
  const dimensionLabels = {
    width: tDimensions('width'),
    depth: tDimensions('depth'),
    height: tDimensions('height'),
    seatHeight: tDimensions('seatHeight'),
    diameter: tDimensions('diameter'),
  };
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Resultado guardado junto com o texto a que pertence: só aparece enquanto o campo ainda tem esse texto.
  // `path`: a página em que a busca foi feita. Ao abrir uma sugestão, a lista some no mesmo quadro em que a página
  // nova entra (o cabeçalho não desmonta): é isso que deixa a miniatura crescer até a foto da página (ideia 10).
  const [result, setResult] = useState<{ q: string; path: string; items: Suggestion[] } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef(0);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Fechar não apaga o texto na hora (o painel ainda está sumindo); abrir de novo começa limpo.
  function close() {
    setOpen(false);
  }

  function openSearch() {
    setQuery('');
    setResult(null);
    setOpen(true);
  }

  // Muda de página: fecha. Estado derivado do caminho, por isso só reage à troca.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const normalized = normalizeSuggestQuery(query);
    const id = ++requestRef.current;
    if (!normalized) {
      return;
    }
    // Rota própria (`/api/suggest`), não server action: cada letra cancela o pedido anterior, e a aba aberta antes de
    // um deploy continua funcionando (retorno de 17/11/2026: as sugestões não apareciam no preview).
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const query = new URLSearchParams({ locale, q: normalized });
        const response = await fetch(`/api/suggest?${query}`, { signal: controller.signal });
        if (!response.ok) return;
        const { data } = (await response.json()) as { data: Suggestion[] };
        if (id === requestRef.current) {
          setResult({ q: normalized, path: pathRef.current, items: data });
        }
      } catch {
        // Cancelado pela letra seguinte, ou sem rede: fica o que já estava.
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  const current = normalizeSuggestQuery(query);
  const fresh = result !== null && result.q === current && result.path === pathname;
  const items = fresh ? result.items : [];
  const searched = fresh;
  // Fotos que se abrem ao passar o mouse numa peça, como na tabela técnica.
  const peeks = items.flatMap((item, index) =>
    item.preview && item.preview.length > 0 ? [{ id: index, images: item.preview, colors: item.colors }] : [],
  );

  // Toque numa sugestão (retorno de 17/11/2026: no celular as sugestões apareciam, mas o toque não levava a nada). Com o
  // teclado aberto, o toque fecha o teclado, a tela muda de altura e o navegador pode não disparar o clique. O toque
  // curto (sem arrastar a lista) navega já no `pointerup`, sem depender do clique; o clique que vier depois é ignorado.
  const tap = useRef<{ id: number; x: number; y: number } | null>(null);
  const tapped = useRef(0);

  function onRowPointerDown(event: ReactPointerEvent) {
    tap.current =
      event.pointerType === 'mouse' ? null : { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onRowPointerUp(event: ReactPointerEvent, item: Suggestion) {
    const start = tap.current;
    tap.current = null;
    if (!start || start.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP_PX) return;
    tapped.current = event.timeStamp;
    // O clique atrasado não deve armar a foto que cresce (navigation-motion) para uma navegação que já começou.
    const link = event.currentTarget;
    link.setAttribute('data-no-motion', '');
    window.setTimeout(() => link.removeAttribute('data-no-motion'), TAP_CLICK_MS);
    router.push(suggestionHref(item));
  }

  function onRowClick(event: ReactMouseEvent) {
    if (tapped.current > 0 && event.timeStamp - tapped.current < TAP_CLICK_MS) event.preventDefault();
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (current) {
      router.push({ pathname: '/search', query: { q: current } });
      close();
    }
  }

  return (
    <div className={open ? 'header-search is-open' : 'header-search'} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('search')}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openSearch())}
      >
        <Icon name={open ? 'close' : 'search'} />
      </button>
      <div className="header-search__panel" id={listId} hidden={!open}>
        <form className="wrap header-search__inner" role="search" onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor={`${listId}-q`}>
            {tSearch('label')}
          </label>
          <div className="header-search__field">
            <Icon name="search" />
            <input
              ref={inputRef}
              id={`${listId}-q`}
              type="search"
              autoComplete="off"
              value={query}
              placeholder={tSearch('placeholder')}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" className="header-search__submit" aria-label={tSearch('submit')}>
              <Icon name="arrow" />
            </button>
          </div>
          <div aria-live="polite">
            {items.length > 0 ? (
              <ul className="header-search__list">
                {items.map((item, index) => {
                  // A miniatura cresce até a foto grande da página que abre (ideia 10, retorno de 09/11/2026).
                  const morph = item.image ? morphName('search', `${item.kind}-${item.slug}`) : undefined;
                  const facts = item.facts;
                  return (
                    <li
                      key={`${item.kind}-${item.slug}`}
                      style={{ '--i': index } as CSSProperties}
                      data-row-id={item.preview && item.preview.length > 0 ? index : undefined}
                    >
                      <Link
                        className={
                          facts ? 'header-search__row header-search__row--product' : 'header-search__row'
                        }
                        href={suggestionHref(item)}
                        transitionTypes={morph ? morphTypes(morph) : undefined}
                        data-morph-link={morph}
                        onPointerDown={onRowPointerDown}
                        onPointerUp={(event) => onRowPointerUp(event, item)}
                        onPointerCancel={() => {
                          tap.current = null;
                        }}
                        onClick={onRowClick}
                      >
                        <span
                          className={`header-search__thumb header-search__thumb--${item.kind}`}
                          aria-hidden="true"
                        >
                          {morph && item.image ? (
                            <MorphImage
                              name={morph}
                              image={{ ...item.image, alt: '' }}
                              sizes="88px"
                              fit={item.kind === 'product' ? 'contain' : 'cover'}
                            />
                          ) : (
                            <ApiImage image={null} sizes="88px" />
                          )}
                        </span>
                        <span className="header-search__main">
                          <span className="header-search__name">{item.name}</span>
                          <small>{facts ? facts.category : tSearch(`kind.${item.kind}`)}</small>
                        </span>
                        {facts ? (
                          // Como na tabela técnica (retorno de 09/11/2026): linha, designer e medida.
                          <>
                            <span className="header-search__fact">
                              <AreaDot area={facts.area} />
                              {facts.line}
                            </span>
                            <span className="header-search__fact">{facts.designer ?? tTable('empty')}</span>
                            <span className="header-search__fact num">
                              {facts.dimension
                                ? formatDimension(facts.dimension, locale as Locale, dimensionLabels)
                                : tTable('empty')}
                            </span>
                          </>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {peeks.length > 0 ? (
              <RowPeek items={peeks} container=".header-search__list" className="row-peek--top" />
            ) : null}
            {items.length === 0 && searched ? (
              <p className="header-search__empty">{tSearch('noResults')}</p>
            ) : null}
          </div>
          {items.length > 0 ? (
            <button type="submit" className="link-arrow header-search__all">
              {tSearch('seeAll')}
              <Icon name="arrow" />
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
