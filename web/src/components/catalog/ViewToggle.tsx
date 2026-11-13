'use client';

import { useTranslations } from 'next-intl';
import { createContext, useContext, useState, type MouseEvent, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link, type AppHref } from '@/i18n/navigation';
import type { CatalogView } from '@/lib/catalog/view';

/**
 * Troca Grade/Tabela técnica sem ir ao servidor (retorno de 13/11/2026: "às vezes só muda, às vezes recarrega a
 * página, principalmente filtrado"). A página já vem com as duas vistas; o clique troca a vista no navegador e só
 * reescreve o endereço (`history.replaceState`, que o roteador do Next acompanha), sem navegação. Fora de um
 * `CatalogViewProvider`, os links navegam como antes. Sem JavaScript, também.
 */
const ViewContext = createContext<{ view: CatalogView; setView: (view: CatalogView) => void } | null>(null);

export function CatalogViewProvider({ initial, children }: { initial: CatalogView; children: ReactNode }) {
  const [view, setView] = useState<CatalogView>(initial);
  return <ViewContext.Provider value={{ view, setView }}>{children}</ViewContext.Provider>;
}

/**
 * Mostra só a vista escolhida: a grade e a tabela dão o mesmo nome à foto de cada peça na transição (ideia 10), e
 * duas fotos com o mesmo nome na tela desligam o movimento.
 */
export function ByView({ grid, table }: { grid: ReactNode; table: ReactNode }) {
  const context = useContext(ViewContext);
  return <>{context?.view === 'table' ? table : grid}</>;
}

/** O filtro enviado mantém a vista escolhida aqui, não a do carregamento da página. */
export function ViewHiddenInput() {
  const context = useContext(ViewContext);
  return context?.view === 'table' ? <input type="hidden" name="view" value="table" /> : null;
}

export function ViewToggle({ view, hrefs }: { view: CatalogView; hrefs: Record<CatalogView, AppHref> }) {
  const t = useTranslations('catalog.view');
  const context = useContext(ViewContext);
  const current = context?.view ?? view;

  function choose(next: CatalogView, event: MouseEvent<HTMLAnchorElement>) {
    if (!context || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    if (next === context.view) return;
    context.setView(next);
    window.history.replaceState(window.history.state, '', event.currentTarget.href);
  }

  return (
    <div className="view-toggle" role="group" aria-label={t('label')}>
      <Link
        href={hrefs.grid}
        scroll={false}
        aria-current={current === 'grid' ? 'true' : undefined}
        onClick={(event) => choose('grid', event)}
      >
        <Icon name="grid" />
        <span>{t('grid')}</span>
      </Link>
      <Link
        href={hrefs.table}
        scroll={false}
        aria-current={current === 'table' ? 'true' : undefined}
        onClick={(event) => choose('table', event)}
      >
        <Icon name="table" />
        <span>{t('table')}</span>
      </Link>
    </div>
  );
}
