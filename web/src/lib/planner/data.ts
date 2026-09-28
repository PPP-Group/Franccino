import type { Locale } from '@/i18n/config';
import { getProductDetails, getProducts, type ProductListParams } from '@/lib/api/catalog';
import { toPlannerProduct } from './product';
import type { PlannerProduct } from './types';

/** Peças com medida para a sala (servidor): listagem + detalhe de cada uma (conflito C1). */
export async function loadPlannerProducts(
  locale: Locale,
  params: ProductListParams,
): Promise<PlannerProduct[]> {
  const page = await getProducts(locale, params);
  const details = await getProductDetails(
    locale,
    page.data.map((product) => product.slug),
  );
  return details
    .map((detail) => toPlannerProduct(detail, locale))
    .filter((product): product is PlannerProduct => product !== null);
}
