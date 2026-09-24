/**
 * Parses and serializes the product listing filters shared by `/products`,
 * `/indoor`, `/outdoor` and their category routes. Reads from the plain
 * object `searchParams` pages get from Next (values are `string | string[]
 * | undefined`) and produces the subset of `ProductListParams` (see
 * `@/lib/api/catalog`) that came from valid, known filters — anything else
 * (unknown keys, malformed values) is silently dropped rather than sent to
 * the API.
 */

import type { ProductListParams, ProductSort } from './catalog';

const SORTS: ProductSort[] = ['featured', 'name', 'newest'];

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseListingParams(searchParams: RawSearchParams): ProductListParams {
  const result: ProductListParams = {};

  for (const key of ['category', 'designer', 'collection', 'line', 'q'] as const) {
    const value = firstValue(searchParams[key]);
    if (value) {
      result[key] = value;
    }
  }

  const finish = parsePositiveInteger(firstValue(searchParams.finish));
  if (finish !== undefined) {
    result.finish = finish;
  }

  const sort = firstValue(searchParams.sort);
  if (sort && (SORTS as string[]).includes(sort)) {
    result.sort = sort as ProductSort;
  }

  const page = parsePositiveInteger(firstValue(searchParams.page));
  if (page !== undefined) {
    result.page = page;
  }

  return result;
}

/** Serializes `params` back to a query string (`""` or `"?a=1&b=2"`), omitting empty values and the default page. */
export function listingQueryString(params: ProductListParams): string {
  const { category, designer, collection, line, finish, q, sort, page } = params;
  const searchParams = new URLSearchParams();

  if (category) searchParams.set('category', category);
  if (designer) searchParams.set('designer', designer);
  if (collection) searchParams.set('collection', collection);
  if (line) searchParams.set('line', line);
  if (finish !== undefined) searchParams.set('finish', String(finish));
  if (q) searchParams.set('q', q);
  if (sort) searchParams.set('sort', sort);
  if (page !== undefined && page !== 1) searchParams.set('page', String(page));

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
