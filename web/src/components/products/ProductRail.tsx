import type { ProductCard } from '@/lib/api/types';
import { ProductPlate } from './ProductPlate';

/** Trilho horizontal com rolagem por teclado (região focável, rótulo obrigatório). */
export function ProductRail({
  label,
  products,
  showNew = false,
}: {
  label: string;
  products: ProductCard[];
  showNew?: boolean;
}) {
  return (
    <div className="rail" role="region" aria-label={label} tabIndex={0}>
      {products.map((product) => (
        <ProductPlate
          key={product.id}
          product={product}
          showNew={showNew}
          sizes="(max-width: 35rem) 80vw, 340px"
        />
      ))}
    </div>
  );
}
