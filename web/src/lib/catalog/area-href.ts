import type { AppHref } from '@/i18n/navigation';
import type { ProductListParams } from '@/lib/api/catalog';
import type { AreaRef } from '@/lib/api/types';
import { listingQuery, type CatalogView, type ListingPatch } from './view';

export function productsListingHref(params: ProductListParams, view: CatalogView) {
  return (patch: ListingPatch): AppHref => ({
    pathname: '/products',
    query: listingQuery(params, view, patch),
  });
}

/** Na área, a categoria é rota (`/indoor/[category]`), não query. */
export function areaListingHref(area: AreaRef['key'], params: ProductListParams, view: CatalogView) {
  return (patch: ListingPatch): AppHref => {
    const category = 'category' in patch ? patch.category : params.category;
    const rest: ListingPatch = { ...patch };
    delete rest.category;
    if ('category' in patch && !('page' in patch)) {
      rest.page = undefined;
    }
    const query = listingQuery({ ...params, category: undefined }, view, rest);
    if (area === 'outdoor') {
      return category
        ? { pathname: '/outdoor/[category]', params: { category }, query }
        : { pathname: '/outdoor', query };
    }
    return category
      ? { pathname: '/indoor/[category]', params: { category }, query }
      : { pathname: '/indoor', query };
  };
}
