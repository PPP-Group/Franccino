import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { ProductVariant } from '@/lib/api/types';

/**
 * Variações da peça (revisão da Franccino, 12/11/2026, item 13): outras versões dela (com e sem braço, outra medida),
 * ligadas no painel. Cada uma abre a própria página; sem variação, a seção some.
 */
export function ProductVariants({ variants }: { variants: ProductVariant[] }) {
  const t = useTranslations('product.variants');
  if (variants.length === 0) {
    return null;
  }
  return (
    <section className="variants" aria-labelledby="variants-title">
      <h2 id="variants-title" className="variants__title">
        {t('title')}
      </h2>
      <ul className="variants__list">
        {variants.map((variant) => (
          <li key={variant.id}>
            <Link
              className="variants__item"
              href={{ pathname: '/products/[slug]', params: { slug: variant.slug } }}
            >
              <span className="variants__thumb">
                <ApiImage image={variant.image} sizes="72px" />
              </span>
              <span>{variant.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
