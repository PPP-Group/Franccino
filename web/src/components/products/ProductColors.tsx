import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';

type ColorChoice = {
  id: number;
  slug: string;
  name: string;
  color: string | null;
  cover: ProductCard['cover'];
};

/**
 * A mesma peça em outras cores (retorno de 16/11/2026): as peças do grupo, ligadas no painel ("A mesma peça em outras
 * cores"), lado a lado pela capa, com a cor desta marcada. Cada cor é uma peça própria: o clique abre a página dela.
 * Sem outras cores, a seção some.
 */
export function ProductColors({
  product,
}: {
  product: Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover' | 'color' | 'colors'>;
}) {
  const t = useTranslations('product.colors');
  const others = product.colors ?? [];
  if (others.length === 0) {
    return null;
  }
  const self: ColorChoice = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    color: product.color ?? null,
    cover: product.cover,
  };
  // Mesma ordem em todas as peças do grupo (a do painel, pelo id), com esta no lugar dela.
  const choices = [self, ...others].sort((a, b) => a.id - b.id);
  return (
    <section className="colors" aria-labelledby="colors-title">
      <h2 id="colors-title" className="colors__title">
        {t('title')}
        {product.color ? <span className="colors__current">{product.color}</span> : null}
      </h2>
      <ul className="colors__list">
        {choices.map((choice) => {
          const label = choice.color ?? choice.name;
          const current = choice.id === product.id;
          return (
            <li key={choice.id}>
              {current ? (
                <span className="colors__item is-current" aria-current="true" title={label}>
                  <ApiImage image={choice.cover} sizes="72px" />
                  <span className="visually-hidden">{t('current', { color: label })}</span>
                </span>
              ) : (
                <Link
                  className="colors__item"
                  href={{ pathname: '/products/[slug]', params: { slug: choice.slug } }}
                  title={label}
                >
                  <ApiImage image={choice.cover} sizes="72px" />
                  <span className="visually-hidden">{t('other', { color: label })}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
