'use client';

import { useLocale, useTranslations } from 'next-intl';
import { type CSSProperties, type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { suggestSearch } from '@/lib/search/actions';
import { normalizeSuggestQuery, type Suggestion } from '@/lib/search/suggest';

const DEBOUNCE_MS = 250;

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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Resultado guardado junto com o texto a que pertence: só aparece enquanto o campo ainda tem esse texto.
  const [result, setResult] = useState<{ q: string; items: Suggestion[] } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef(0);

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
    const timer = window.setTimeout(async () => {
      const found = await suggestSearch(locale, normalized);
      if (id === requestRef.current) {
        setResult({ q: normalized, items: found });
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, locale]);

  const current = normalizeSuggestQuery(query);
  const items = result && result.q === current ? result.items : [];
  const searched = result !== null && result.q === current;

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
                {items.map((item, index) => (
                  <li key={`${item.kind}-${item.slug}`} style={{ '--i': index } as CSSProperties}>
                    <Link href={suggestionHref(item)} onClick={close}>
                      <span
                        className={`header-search__thumb header-search__thumb--${item.kind}`}
                        aria-hidden="true"
                      >
                        <ApiImage image={item.image ? { ...item.image, alt: '' } : null} sizes="88px" />
                      </span>
                      <span className="header-search__name">{item.name}</span>
                      <small>{tSearch(`kind.${item.kind}`)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : searched ? (
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
