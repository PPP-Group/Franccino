'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { ProductPlate } from '@/components/products/ProductPlate';
import { type AppHref, Link } from '@/i18n/navigation';
import type { ProductListParams } from '@/lib/api/catalog';
import type { ProductCard } from '@/lib/api/types';
import { loadMorePieces } from '@/lib/catalog/actions';
import { loadMoreAction, type LoadMoreState, previousStart, undoLoad } from '@/lib/catalog/load-more';

type LoadMoreProps = {
  /** Filtros da listagem (os mesmos da primeira página). */
  query: ProductListParams;
  page: number;
  lastPage: number;
  total: number;
  /** Peças já na tela vindas do servidor (a primeira página). */
  shown: number;
  perPage: number;
  /** Endereço de cada página da lista (índice = número da página), para o link depois do limite. */
  pageHrefs: Record<number, AppHref>;
};

type Saved = LoadMoreState & { items: ProductCard[]; entry?: string | null };

function storageKey() {
  return `franccino:more:${window.location.pathname}${window.location.search}`;
}

/** Entrada do histórico em que a pessoa está (API Navigation), quando o navegador a tem. */
function historyEntry(): string | null {
  const navigation = (window as Window & { navigation?: { currentEntry?: { key?: string } | null } })
    .navigation;
  return navigation?.currentEntry?.key ?? null;
}

// Hora do último "voltar"/"avançar" do navegador, para quem não tem a API Navigation.
let lastTraversal = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    lastTraversal = Date.now();
  });
}
const TRAVERSAL_MS = 10000;

/**
 * As peças somadas só voltam quando a pessoa volta a esta mesma entrada do histórico (o "voltar" da página de uma peça).
 * Abrir a lista de novo por um link começa do zero (retorno de 16/11/2026: a página seguinte abria com as quatro somas
 * de uma visita antiga, sem "Ver mais").
 */
function canRestore(saved: Saved): boolean {
  const entry = historyEntry();
  if (entry && saved.entry) return entry === saved.entry;
  return Date.now() - lastTraversal < TRAVERSAL_MS;
}

/** Rola suave até o elemento, abaixo do cabeçalho fixo. */
function scrollToStart(element: HTMLElement | null) {
  if (!element) return;
  const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
  const top = element.getBoundingClientRect().top - header - 16;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: window.scrollY + top, behavior: reduce ? 'auto' : 'smooth' });
}

/**
 * "Ver mais" das listagens (revisão da Franccino, 12/11/2026, item 11): no lugar de "Próxima", o botão soma as peças da
 * página seguinte embaixo das que já estão na tela, com a contagem ("24 de 213 peças"). Depois de três vezes, vira o
 * link da página seguinte, para a página não crescer sem fim. As peças somadas ficam guardadas na aba: ao voltar de uma
 * peça, a lista volta inteira e a rolagem cai no mesmo lugar. Para voltar (retorno de 16/11/2026): "Ver menos" tira as
 * peças da última soma e "Ver as peças anteriores" abre o trecho de antes, sem depender da seta do navegador.
 */
export function LoadMore({ query, page, lastPage, total, shown, perPage, pageHrefs }: LoadMoreProps) {
  const t = useTranslations('catalog.loadMore');
  const locale = useLocale();
  const [state, setState] = useState<Saved>({ page, loads: 0, items: [] });
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const groups = useRef<HTMLDivElement>(null);

  // Antes da primeira pintura, para a rolagem guardada da volta encontrar a lista inteira.
  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey());
      const saved = raw ? (JSON.parse(raw) as Saved) : null;
      if (saved && saved.page > page && Array.isArray(saved.items) && canRestore(saved)) {
        // Restaura uma vez, antes da pintura; ler a aba no primeiro render daria outra lista no servidor e no navegador.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(saved);
      }
    } catch {
      // Sem sessionStorage: a lista começa da primeira página.
    }
  }, [page]);

  function loadNext() {
    const next = state.page + 1;
    setFailed(false);
    startTransition(async () => {
      const result = await loadMorePieces(locale, query, next);
      if (!result) {
        setFailed(true);
        return;
      }
      const updated: Saved = {
        page: result.meta.current_page,
        loads: state.loads + 1,
        items: [...state.items, ...result.data],
      };
      setState(updated);
      save(updated);
    });
  }

  function save(next: Saved) {
    try {
      sessionStorage.setItem(storageKey(), JSON.stringify({ ...next, entry: historyEntry() }));
    } catch {
      // Sem sessionStorage: só não volta inteira depois.
    }
  }

  function showLess() {
    const updated = undoLoad(state, perPage);
    setState(updated);
    save(updated);
    setFailed(false);
    // Volta ao começo do grupo de peças que ficou por último (o primeiro, com só as da página, é o começo da lista).
    window.requestAnimationFrame(() => {
      const target =
        updated.loads > 0
          ? groups.current?.querySelector<HTMLElement>(`[data-load-group="${updated.loads - 1}"]`)
          : document.querySelector<HTMLElement>('.catalog-results');
      scrollToStart(target ?? null);
    });
  }

  const action = loadMoreAction(state, lastPage);
  const previous = previousStart(page);
  const previousHref = previous ? pageHrefs[previous] : undefined;
  // Peças até aqui na lista inteira (quem abriu a página 5 já passou pelas 4 primeiras).
  const visible = (page - 1) * perPage + shown + state.items.length;
  const nextHref = pageHrefs[state.page + 1];
  return (
    <>
      {state.items.length > 0 ? (
        // Um grupo por "Ver mais", para o "Ver menos" voltar ao começo do grupo certo.
        <div ref={groups}>
          {Array.from({ length: Math.ceil(state.items.length / perPage) }, (_, group) => (
            <div key={group} className="grid-plates load-more__grid" data-load-group={group}>
              {state.items.slice(group * perPage, (group + 1) * perPage).map((product) => (
                <ProductPlate key={product.id} product={product} showNew />
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {total > 0 ? (
        <div ref={bar} className="load-more" aria-live="polite">
          <p className="meta num">{t('count', { shown: visible, total })}</p>
          <div className="load-more__actions">
            {state.loads > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={showLess} disabled={pending}>
                {t('less')}
              </button>
            ) : null}
            {action === 'button' ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={loadNext}
                disabled={pending}
                aria-busy={pending}
              >
                {pending ? t('loading') : t('button')}
              </button>
            ) : null}
            {action === 'next-page' && nextHref ? (
              <Link className="btn btn--ghost" href={nextHref}>
                {t('nextPage')}
              </Link>
            ) : null}
          </div>
          {previousHref ? (
            <Link className="link-arrow" href={previousHref}>
              {t('previousPage')}
            </Link>
          ) : null}
          {failed ? <p className="meta">{t('error')}</p> : null}
        </div>
      ) : null}
    </>
  );
}
