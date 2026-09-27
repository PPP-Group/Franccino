import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { AreaDot } from '@/components/ui/AreaDot';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import { QuickAddButton } from './QuickAddButton';

/** Larguras reais da prancha: 1 coluna no celular, 2 no tablet, ~4 no desktop. */
export const PLATE_SIZES = '(max-width: 35rem) 100vw, (max-width: 73.75rem) 50vw, 25vw';

type ProductPlateProps = {
  product: ProductCard;
  showNew?: boolean;
  sizes?: string;
  priority?: boolean;
};

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
          {product.cover ? <ApiImage image={product.cover} sizes={sizes} priority={priority} /> : null}
        </div>
        <div className="plate__body">
          <h3 className="plate__name">{product.name}</h3>
          <div className="plate__row">
            {product.designer ? <span className="meta">{product.designer.name}</span> : <span />}
            <span className="meta">
              <AreaDot area={product.area.key} />
              {product.category.name}
            </span>
          </div>
        </div>
      </Link>
      {showNew && product.is_new ? (
        <div className="plate__tags">
          <span className="tag tag--new">{t('newTag')}</span>
        </div>
      ) : null}
      <QuickAddButton product={product} />
    </article>
  );
}
