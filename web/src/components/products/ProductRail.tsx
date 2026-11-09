import { Rail } from '@/components/ui/Rail';
import { ProductPlate, type PlateProduct } from './ProductPlate';

/** Largura do card na esteira (`clamp(250px, 24vw, 340px)` em plates.css), com folga para o aumento do hover. */
const RAIL_SIZES = '(max-width: 65rem) 260px, (max-width: 88.5rem) 25vw, 354px';

/**
 * Esteira de peças (banco de ideias, ideia 1, retorno de 26/10/2026): só a foto e o nome, sem etiqueta, sem botão de
 * acabamento, de "ver peça" ou de 3D. O clique na peça abre a página dela, onde ficam o 3D e os acabamentos. Rola com o
 * dedo, o trackpad e o teclado; as duas setas discretas do `Rail` somem quando tudo cabe na tela.
 */
export function ProductRail({
  label,
  products,
  scope,
}: {
  label: string;
  products: PlateProduct[];
  /**
   * Nome da esteira na transição da foto (ideia 10): a mesma peça aparece em duas esteiras da mesma página ("Peças
   * que você viu" e "Recomendadas"), e dois nomes iguais faziam a transição falhar na ida (retorno de 09/11/2026).
   */
  scope: string;
}) {
  return (
    <Rail label={label} className="product-rail">
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <ProductPlate product={product} sizes={RAIL_SIZES} morphScope={scope} />
          </li>
        ))}
      </ul>
    </Rail>
  );
}
