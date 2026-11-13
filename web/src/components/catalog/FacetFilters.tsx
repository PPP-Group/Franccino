'use client';

import { useTranslations } from 'next-intl';
import { Fragment, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { crossCounts, type FacetMatrix, type FacetName, type FacetSelection } from '@/lib/catalog/facets';
import type { FilterOption } from '@/lib/catalog/view';
import type { Image } from '@/lib/api/types';

export type FacetFilter = {
  name: FacetName;
  label: string;
  allLabel: string;
  options: FilterOption[];
  active?: string;
  imageTone?: 'mono';
};

/**
 * Os filtros da barra do catálogo, ligados entre si (retorno de 13/11/2026): escolher uma opção atualiza na hora a
 * contagem das opções dos outros filtros, antes do "Aplicar". Sem a matriz (API antiga), ficam as contagens do
 * servidor. A barra remonta quando os filtros aplicados mudam (`key` no `CatalogToolbar`), então "Limpar filtros"
 * também volta as listas para "Todas".
 */
export function FacetFilters({ filters, matrix }: { filters: FacetFilter[]; matrix: FacetMatrix | null }) {
  const t = useTranslations('catalog.filters');
  const [selection, setSelection] = useState<FacetSelection>(() =>
    Object.fromEntries(
      filters.filter((filter) => filter.active).map((filter) => [filter.name, filter.active]),
    ),
  );
  const counts = useMemo(() => (matrix ? crossCounts(matrix, selection) : null), [matrix, selection]);

  return filters.map((filter) => {
    const live = counts && matrix?.names.includes(filter.name) ? counts[filter.name] : null;
    return (
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
          imageTone={filter.imageTone}
          onValueChange={(value) =>
            setSelection((current) => ({ ...current, [filter.name]: value || undefined }))
          }
          options={[
            { value: '', label: filter.allLabel },
            ...filter.options.map((option) => {
              const count = live ? (live.get(option.value) ?? 0) : option.count;
              return {
                value: option.value,
                image: option.image as Image | null | undefined,
                muted: count === 0,
                label: count === null ? option.label : t('facetOption', { name: option.label, count }),
              };
            }),
          ]}
        />
      </Fragment>
    );
  });
}
