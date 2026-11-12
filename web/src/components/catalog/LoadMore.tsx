'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useLayoutEffect, useState, useTransition } from 'react';
import { ProductPlate } from '@/components/products/ProductPlate';
import { type AppHref, Link } from '@/i18n/navigation';
import type { ProductListParams } from '@/lib/api/catalog';
import type { ProductCard } from '@/lib/api/types';
import { loadMorePieces } from '@/lib/catalog/actions';
import { loadMoreAction, type LoadMoreState } from '@/lib/catalog/load-more';

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

type Saved = LoadMoreState & { items: ProductCard[] };

function storageKey() {
  return `franccino:more:${window.location.pathname}${window.location.search}`;
}

/**
 * "Ver mais" das listagens (revisão da Franccino, 12/11/2026, item 11): no lugar de "Próxima", o botão soma as peças da
 * página seguinte embaixo das que já estão na tela, com a contagem ("24 de 213 peças"). Depois de três vezes, vira o
 * link da página seguinte, para a página não crescer sem fim. As peças somadas ficam guardadas na aba: ao voltar de uma
 * peça, a lista volta inteira e a rolagem cai no mesmo lugar.
 */
export function LoadMore({ query, page, lastPage, total, shown, perPage, pageHrefs }: LoadMoreProps) {
  const t = useTranslations('catalog.loadMore');
  const locale = useLocale();
  const [state, setState] = useState<Saved>({ page, loads: 0, items: [] });
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  // Antes da primeira pintura, para a rolagem guardada da volta encontrar a lista inteira.
  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey());
      const saved = raw ? (JSON.parse(raw) as Saved) : null;
      if (saved && saved.page > page && Array.isArray(saved.items)) {
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
      try {
        sessionStorage.setItem(storageKey(), JSON.stringify(updated));
      } catch {
        // Sem sessionStorage: só não volta inteira depois.
      }
    });
  }

  const action = loadMoreAction(state, lastPage);
  // Peças até aqui na lista inteira (quem abriu a página 5 já passou pelas 4 primeiras).
  const visible = (page - 1) * perPage + shown + state.items.length;
  const nextHref = pageHrefs[state.page + 1];
  return (
    <>
      {state.items.length > 0 ? (
        <div className="grid-plates load-more__grid">
          {state.items.map((product) => (
            <ProductPlate key={product.id} product={product} showNew />
          ))}
        </div>
      ) : null}
      {total > 0 ? (
        <div className="load-more" aria-live="polite">
          <p className="meta num">{t('count', { shown: visible, total })}</p>
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
          {failed ? <p className="meta">{t('error')}</p> : null}
        </div>
      ) : null}
    </>
  );
}
