import { Rail } from '@/components/ui/Rail';
import type { ProductCard } from '@/lib/api/types';
import { ProductPlate } from './ProductPlate';

/**
 * Esteira de peças (banco de ideias, ideia 1, retorno de 26/10/2026): só a foto e o nome, sem etiqueta, sem botão de
 * acabamento, de "ver peça" ou de 3D. O clique na peça abre a página dela, onde ficam o 3D e os acabamentos. Rola com o
 * dedo, o trackpad e o teclado; as duas setas discretas do `Rail` somem quando tudo cabe na tela.
 */
export function ProductRail({ label, products }: { label: string; products: ProductCard[] }) {
  return (
    <Rail label={label} className="product-rail">
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <ProductPlate product={product} sizes="(max-width: 35rem) 80vw, 340px" />
          </li>
        ))}
      </ul>
    </Rail>
  );
}
