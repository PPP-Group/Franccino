import { useTranslations } from 'next-intl';
import { ViewTransition, type CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';

/** O que o card usa: foto, nome e o sinal de lançamento (também serve às peças guardadas em "Peças que você viu"). */
export type PlateProduct = Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover' | 'is_new'>;

/**
 * Nome da transição que leva a foto do card até a foto grande da página da peça (banco de ideias, ideia 10: "você
 * clica e a imagem vai crescendo"). O mesmo nome fica na primeira foto de `ProductStage`.
 */
export function productMorphName(slug: string): string {
  return `product-${slug}`;
}

/**
 * Largura real da foto na grade (`.grid-plates`, plates.css), com folga para o zoom de 5% do hover (`.hover-zoom`):
 * 2 colunas até 73,75rem (celular e tablet), 3 no desktop e no máximo ~473 px (450 px de coluna) quando a página chega
 * à largura máxima (`--max`).
 */
export const PLATE_SIZES = '(max-width: 73.75rem) 48vw, (min-width: 97.5rem) 473px, 30vw';

type ProductPlateProps = {
  product: PlateProduct;
  showNew?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Card do produto no visual "clean" pedido pelo cliente (06/10/2026): só a foto e o nome, solto sobre o fundo branco,
 * sem caixa, borda nem sombra. No hover (retorno de 06/11/2026) a foto aproxima dentro do próprio quadro
 * (`.hover-zoom`) e o nome ganha o preto cheio; nada sai do quadro, então nada é cortado nas esteiras. O sinal de
 * lançamento é um rótulo discreto abaixo do nome, na cor madeira, sem caixa.
 */
export function ProductPlate({
  product,
  showNew = false,
  sizes = PLATE_SIZES,
  priority = false,
}: ProductPlateProps) {
  const t = useTranslations('catalog');
  const cover = product.cover;
  // A foto nunca passa da própria largura: as originais do catálogo são pequenas, e ampliar borra.
  const mediaStyle = cover?.width ? ({ '--plate-img-max': `${cover.width}px` } as CSSProperties) : undefined;
  return (
    <article className="plate">
      <Link className="plate__link" href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
        <div
          className={cover ? 'plate__media hover-zoom' : 'plate__media plate__media--empty'}
          style={mediaStyle}
        >
          {cover ? (
            <ViewTransition name={productMorphName(product.slug)} share="product-morph" default="none">
              <ApiImage image={cover} sizes={sizes} priority={priority} />
            </ViewTransition>
          ) : null}
        </div>
        <div className="plate__body">
          <h3 className="plate__name">{product.name}</h3>
          {showNew && product.is_new ? <p className="plate__flag">{t('newTag')}</p> : null}
        </div>
      </Link>
    </article>
  );
}
