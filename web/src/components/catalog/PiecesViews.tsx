'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { CatalogView } from '@/lib/catalog/view';

/**
 * Grade e tabela técnica das peças de uma coleção, designer ou lançamento, com a mesma barra do catálogo (retorno de
 * 09/11/2026: "tem lugar que é de um jeito, tem outro que é de outro"). A troca é no navegador (as páginas são
 * estáticas); só a vista escolhida fica montada, porque as duas usam o mesmo nome na transição da foto.
 */
export function PiecesViews({ count, grid, table }: { count: string; grid: ReactNode; table: ReactNode }) {
  const t = useTranslations('catalog.view');
  const [view, setView] = useState<CatalogView>('grid');
  return (
    <>
      <div className="toolbar toolbar--pieces">
        <span className="meta num">{count}</span>
        <div className="view-toggle" role="group" aria-label={t('label')}>
          <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            <Icon name="grid" />
            <span>{t('grid')}</span>
          </button>
          <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
            <Icon name="table" />
            <span>{t('table')}</span>
          </button>
        </div>
      </div>
      {view === 'table' ? table : grid}
    </>
  );
}
