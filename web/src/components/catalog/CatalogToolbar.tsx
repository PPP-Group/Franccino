import { useTranslations } from 'next-intl';
import { Link, type AppHref } from '@/i18n/navigation';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { ViewToggle } from './ViewToggle';

type CatalogToolbarProps = {
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  categoryOptions: FilterOption[];
  activeCategory?: string;
  designerOptions: FilterOption[];
  activeDesigner?: string;
  /** Caminho público da listagem (form GET do filtro de designer, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
};

export function CatalogToolbar(props: CatalogToolbarProps) {
  const t = useTranslations('catalog.filters');
  return (
    <div className="toolbar">
      {props.categoryOptions.length > 0 ? (
        <nav className="chips" aria-label={t('categories')}>
          <Link
            className="chip"
            href={props.hrefFor({ category: undefined })}
            scroll={false}
            aria-current={props.activeCategory ? undefined : 'true'}
          >
            {t('all')}
          </Link>
          {props.categoryOptions.map((option) => (
            <Link
              key={option.value}
              className="chip"
              href={props.hrefFor({ category: option.value })}
              scroll={false}
              aria-current={option.value === props.activeCategory ? 'true' : undefined}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      ) : (
        <span />
      )}
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
