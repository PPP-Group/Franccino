'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useIsClient } from '@/lib/ui/use-is-client';

/**
 * Filtros recolhidos num botão "Filtros" no celular (retorno de 17/11/2026: as listas de categoria, coleção e designer
 * empilhadas tomavam a tela antes das peças). O botão só aparece no celular (catalog.css); no resto, os filtros ficam
 * à vista como antes. Sem JavaScript, os filtros ficam sempre abertos. Aplicar fecha o painel.
 */
export function FilterDisclosure({ active, children }: { active: number; children: ReactNode }) {
  const t = useTranslations('catalog.filters');
  const [open, setOpen] = useState(false);
  const ready = useIsClient();
  return (
    <div
      className="filter-disclosure"
      data-ready={ready ? '' : undefined}
      data-open={open ? '' : undefined}
      onSubmit={() => setOpen(false)}
    >
      <button
        type="button"
        className="filter-disclosure__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="filters" />
        <span>{active > 0 ? t('toggleActive', { count: active }) : t('toggle')}</span>
        <Icon name="chevron" className="filter-disclosure__chevron" />
      </button>
      {children}
    </div>
  );
}
