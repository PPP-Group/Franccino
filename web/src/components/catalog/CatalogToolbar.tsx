import { useTranslations } from 'next-intl';
import type { AppHref } from '@/i18n/navigation';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { ViewToggle } from './ViewToggle';

type CatalogToolbarProps = {
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  designerOptions: FilterOption[];
  activeDesigner?: string;
  /** Caminho público da listagem (form GET do filtro de designer, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
};

/**
 * Barra do catálogo: filtro de designer e troca Grade/Tabela técnica. Os botões de categoria saíram do meio da
 * página (ajustes do cliente, 06/10/2026): as categorias ficam no painel de Casa/Giardini do menu do topo.
 */
export function CatalogToolbar(props: CatalogToolbarProps) {
  const t = useTranslations('catalog.filters');
  return (
    <div className="toolbar">
      <div className="toolbar__end">
        {props.designerOptions.length > 0 ? (
          <form className="filter-form" action={props.formAction} method="get">
            {Object.entries(props.hiddenQuery).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <label className="visually-hidden" htmlFor="designer-filter">
              {t('designer')}
            </label>
            <select id="designer-filter" name="designer" defaultValue={props.activeDesigner ?? ''}>
              <option value="">{t('allDesigners')}</option>
              {props.designerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.count === null
                    ? option.label
                    : t('facetOption', { name: option.label, count: option.count })}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn--ghost btn--compact">
              {t('apply')}
            </button>
          </form>
        ) : null}
        <ViewToggle view={props.view} hrefFor={(next) => props.hrefFor({ view: next })} />
      </div>
    </div>
  );
}
