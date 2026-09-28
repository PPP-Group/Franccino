/**
 * Product card grid, shared by every listing that shows `ProductCard`s
 * (`/products`, `/indoor`, `/outdoor` and their category routes, collections,
 * designers, launches, projects and the "related products" sections on
 * detail pages). Pagination is restored by Task 6.
 */

import { ProductPlate } from '@/components/products/ProductPlate';
import type { ProductCard } from '@/lib/api/types';

type ProductGridProps = {
  products: ProductCard[];
  showNew?: boolean;
  /** Quantas primeiras imagens carregam com prioridade (LCP das listagens). */
  priorityCount?: number;
};

export function ProductGrid({ products, showNew = false, priorityCount = 0 }: ProductGridProps) {
  return (
    <div className="grid-plates">
      {products.map((product, index) => (
        <ProductPlate key={product.id} product={product} showNew={showNew} priority={index < priorityCount} />
      ))}
    </div>
  );
}
