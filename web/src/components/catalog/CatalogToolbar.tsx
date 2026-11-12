import { Fragment, type ReactNode } from 'react';
import { FilterForm } from './FilterForm';
import { useTranslations } from 'next-intl';
import type { AppHref } from '@/i18n/navigation';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { Select } from '@/components/ui/Select';
import { ViewToggle } from './ViewToggle';

/** Um filtro da barra: uma lista de opções com foto flutuando ao lado no hover (como o de designer). */
export type ToolbarFilter = {
  /** Nome do parâmetro na URL (`category`, `room`, `collection`, `designer`). */
  name: string;
  label: string;
  allLabel: string;
  options: FilterOption[];
  active?: string;
};

type CatalogToolbarProps = {
  /** Contagem já formatada ("181 peças"), à esquerda da barra. */
  count: string;
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  /** Filtros com opção; o que não tem opção não aparece. */
  filters: ToolbarFilter[];
  /** Caminho público da listagem (form GET dos filtros, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
  /** "Anterior" e "Próxima" ao lado da contagem (`Pagination position="top"`). */
  pager?: ReactNode;
};

/**
 * Barra do catálogo: contagem à esquerda; filtros e troca Grade/Tabela técnica à direita. Os filtros (categoria,
 * ambiente, coleção e designer, retorno de 12/11/2026) seguem o desenho do filtro de designer: a lista própria e a
 * foto da opção flutuando ao lado no hover. Um "Aplicar" envia todos.
 */
export function CatalogToolbar(props: CatalogToolbarProps) {
  const t = useTranslations('catalog.filters');
  const filters = props.filters.filter((filter) => filter.options.length > 0);
  return (
    <div className="toolbar toolbar--catalog">
      <div className="toolbar__start">
        <p className="meta num">{props.count}</p>
        {props.pager}
      </div>
      <div className="toolbar__end">
        {filters.length > 0 ? (
          <FilterForm className="filter-form" action={props.formAction}>
            {Object.entries(props.hiddenQuery).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            {filters.map((filter) => (
              <Fragment key={filter.name}>
                <label
                  className="visually-hidden"
                  id={`${filter.name}-filter-label`}
                  htmlFor={`${filter.name}-filter`}
                >
                  {filter.label}
                </label>
                <Select
                  id={`${filter.name}-filter`}
                  labelId={`${filter.name}-filter-label`}
                  name={filter.name}
                  defaultValue={filter.active ?? ''}
                  options={[
                    { value: '', label: filter.allLabel },
                    ...filter.options.map((option) => ({
                      value: option.value,
                      image: option.image,
                      label:
                        option.count === null
                          ? option.label
                          : t('facetOption', { name: option.label, count: option.count }),
                    })),
                  ]}
                />
              </Fragment>
            ))}
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
