import { useTranslations } from 'next-intl';
import { ViewTransition } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';

/**
 * Nome da transição que leva a foto do card até a foto grande da página da peça (banco de ideias, ideia 10: "você
 * clica e a imagem vai crescendo"). O mesmo nome fica na primeira foto de `ProductStage`.
 */
export function productMorphName(slug: string): string {
  return `product-${slug}`;
}

/** Larguras reais da prancha: 1 coluna no celular, 2 no tablet, ~4 no desktop. */
export const PLATE_SIZES = '(max-width: 35rem) 100vw, (max-width: 73.75rem) 50vw, 25vw';

type ProductPlateProps = {
  product: ProductCard;
  showNew?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Card do produto no visual "clean" pedido pelo cliente (06/10/2026): só a foto e o nome, solto sobre o
 * fundo branco, sem caixa nem borda. Designer, categoria e o botão "+" saíram do card; a lista de
 * orçamento continua na página do produto e na tabela técnica.
 */
export function ProductPlate({
  product,
  showNew = false,
  sizes = PLATE_SIZES,
  priority = false,
}: ProductPlateProps) {
  const t = useTranslations('catalog');
  return (
    <article className="plate">
      <Link className="plate__link" href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
        <div className={product.cover ? 'plate__media' : 'plate__media plate__media--empty'}>
          {product.cover ? (
            <ViewTransition name={productMorphName(product.slug)} share="product-morph" default="none">
              <ApiImage image={product.cover} sizes={sizes} priority={priority} />
            </ViewTransition>
          ) : null}
        </div>
        <h3 className="plate__name">{product.name}</h3>
      </Link>
      {showNew && product.is_new ? (
        <div className="plate__tags">
          <span className="tag tag--new">{t('newTag')}</span>
        </div>
      ) : null}
    </article>
  );
}
