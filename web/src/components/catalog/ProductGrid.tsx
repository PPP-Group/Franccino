/**
 * Product card grid, shared by every listing that shows `ProductCard`s
 * (`/products`, `/indoor`, `/outdoor` and their category routes, collections,
 * designers, launches, projects and the "related products" sections on
 * detail pages). Pagination is restored by Task 6.
 */

import { useTranslations } from 'next-intl';
import { LeadPlate } from '@/components/products/LeadPlate';
import { ProductPlate } from '@/components/products/ProductPlate';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import { gridFillClass } from '@/lib/catalog/grid-fill';

type ProductGridProps = {
  products: ProductCard[];
  showNew?: boolean;
  /** Quantas primeiras imagens carregam com prioridade (LCP das listagens). */
  priorityCount?: number;
  /** Completa a última linha com o bloco de ajuda (grade sempre completa, rodada 3). */
  fill?: boolean;
  /** Grade principal da lista: recebe em primeiro a peça de onde a lista foi aberta (`LeadPlate`). */
  lead?: boolean;
};

export function ProductGrid({
  products,
  showNew = false,
  priorityCount = 0,
  fill = true,
  lead = false,
}: ProductGridProps) {
  const fillClass = fill ? gridFillClass(products.length) : null;
  return (
    <div className="grid-plates" data-reveal="stagger">
      {lead ? <LeadPlate /> : null}
      {products.map((product, index) => (
        <ProductPlate key={product.id} product={product} showNew={showNew} priority={index < priorityCount} />
      ))}
      {fillClass ? <GridFill className={fillClass} /> : null}
    </div>
  );
}

/**
 * Bloco que ocupa as células vazias da última linha (regra 1 da rodada 3: nenhuma grade termina com buraco). Leva a
 * dois caminhos reais do site, a Sala para montar e o contato, sem inventar dado de peça.
 */
function GridFill({ className }: { className: string }) {
  const t = useTranslations('catalog.gridFill');
  return (
    <div className={`grid-fill ${className}`}>
      <div className="grid-fill__copy">
        <h3 className="grid-fill__title">{t('title')}</h3>
        <p>{t('body')}</p>
      </div>
      <div className="grid-fill__links">
        <Link className="link-arrow" href="/room-planner">
          <span>{t('planner')}</span>
          <Icon name="arrow" />
        </Link>
        <Link className="link-arrow" href="/contact">
          <span>{t('contact')}</span>
          <Icon name="arrow" />
        </Link>
      </div>
    </div>
  );
}
