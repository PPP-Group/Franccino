import type { Locale } from '@/i18n/config';
import { getProductDetails, getProducts, type ProductListParams } from '@/lib/api/catalog';
import { toPlannerLibraryItem, toPlannerProduct } from './product';
import type { PlannerLibraryItem, PlannerProduct } from './types';

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

/** Peças da busca da sala, com e sem medida (as sem medida aparecem com o aviso e não entram na planta). */
export async function loadPlannerLibrary(
  locale: Locale,
  params: ProductListParams,
): Promise<PlannerLibraryItem[]> {
  const page = await getProducts(locale, params);
  const details = await getProductDetails(
    locale,
    page.data.map((product) => product.slug),
  );
  return details.map((detail) => toPlannerLibraryItem(detail, locale));
}
