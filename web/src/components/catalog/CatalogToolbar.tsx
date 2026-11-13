import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { AppHref } from '@/i18n/navigation';
import type { FacetMatrix, FacetName } from '@/lib/catalog/facets';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { FacetFilters } from './FacetFilters';
import { FilterForm } from './FilterForm';
import { ViewHiddenInput, ViewToggle } from './ViewToggle';

/** Um filtro da barra: uma lista de opções com foto flutuando ao lado no hover (como o de designer). */
export type ToolbarFilter = {
  /** Nome do parâmetro na URL (`category`, `room`, `collection`, `designer`). */
  name: FacetName;
  label: string;
  allLabel: string;
  options: FilterOption[];
  active?: string;
  /** Fotos das opções em preto e branco (designers). */
  imageTone?: 'mono';
};

type CatalogToolbarProps = {
  /** Contagem já formatada ("181 peças"), à esquerda da barra. */
  count: string;
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  /** Filtros com opção; o que não tem opção não aparece. */
  filters: ToolbarFilter[];
  /** As chaves de cada peça por filtro: a contagem de cada opção cruza os outros filtros, ao vivo. */
  matrix: FacetMatrix | null;
  /** Caminho público da listagem (form GET dos filtros, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
  /** "Anterior" e "Próxima" ao lado da contagem (`Pagination position="top"`), só na tabela técnica. */
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
            {Object.entries(props.hiddenQuery)
              .filter(([name]) => name !== 'view')
              .map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            <ViewHiddenInput />
            {/* Remonta quando os filtros aplicados mudam: "Limpar filtros" volta as listas para "Todas". */}
            <FacetFilters
              key={filters.map((filter) => filter.active ?? '').join('|')}
              filters={filters}
              matrix={props.matrix}
            />
            <button type="submit" className="btn btn--ghost btn--compact">
              {t('apply')}
            </button>
          </FilterForm>
        ) : null}
        <ViewToggle
          view={props.view}
          hrefs={{ grid: props.hrefFor({ view: 'grid' }), table: props.hrefFor({ view: 'table' }) }}
        />
      </div>
    </div>
  );
}
