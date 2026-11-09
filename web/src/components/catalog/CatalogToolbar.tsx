import type { ReactNode } from 'react';
import { FilterForm } from './FilterForm';
import { useTranslations } from 'next-intl';
import type { AppHref } from '@/i18n/navigation';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { Select } from '@/components/ui/Select';
import { ViewToggle } from './ViewToggle';

type CatalogToolbarProps = {
  /** Contagem já formatada ("181 peças"), à esquerda da barra. */
  count: string;
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  designerOptions: FilterOption[];
  activeDesigner?: string;
  /** Caminho público da listagem (form GET do filtro de designer, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
  /** "Anterior" e "Próxima" ao lado da contagem (`Pagination position="top"`). */
  pager?: ReactNode;
};

/**
 * Barra do catálogo: contagem à esquerda; filtro de designer e troca Grade/Tabela técnica à direita (o mesmo arranjo
 * da página Lançamentos). Os botões de categoria saíram do meio da página (ajustes do cliente, 06/10/2026): as
 * categorias ficam no painel de Casa/Giardini do menu do topo.
 */
export function CatalogToolbar(props: CatalogToolbarProps) {
  const t = useTranslations('catalog.filters');
  return (
    <div className="toolbar toolbar--catalog">
      <div className="toolbar__start">
        <p className="meta num">{props.count}</p>
        {props.pager}
      </div>
      <div className="toolbar__end">
        {props.designerOptions.length > 0 ? (
          <FilterForm className="filter-form" action={props.formAction}>
            {Object.entries(props.hiddenQuery).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <label className="visually-hidden" id="designer-filter-label" htmlFor="designer-filter">
              {t('designer')}
            </label>
            <Select
              id="designer-filter"
              labelId="designer-filter-label"
              name="designer"
              defaultValue={props.activeDesigner ?? ''}
              options={[
                { value: '', label: t('allDesigners') },
                ...props.designerOptions.map((option) => ({
                  value: option.value,
                  label:
                    option.count === null
                      ? option.label
                      : t('facetOption', { name: option.label, count: option.count }),
                })),
              ]}
            />
            <button type="submit" className="btn btn--ghost btn--compact">
              {t('apply')}
            </button>
          </FilterForm>
        ) : null}
        <ViewToggle view={props.view} hrefFor={(next) => props.hrefFor({ view: next })} />
      </div>
    </div>
  );
}
