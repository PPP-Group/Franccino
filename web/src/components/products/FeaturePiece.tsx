import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import { morphName, morphTypes } from '@/lib/ui/morph';

/** Coluna de 5/12 da página (até `--max`); no celular, a largura toda. */
const FEATURE_SIZES = '(max-width: 56.25rem) 100vw, (min-width: 97.5rem) 620px, 38vw';
/** Versão compacta (cabeçalho das páginas de lista): o quadro tem 220 px no computador e 132 px no celular. */
const COMPACT_SIZES = '(max-width: 35rem) 140px, 232px';

/**
 * Uma peça em destaque na coluna da direita de um texto (lançamento, projeto), para a página nunca ficar com metade
 * vazia (retorno do tech lead de 06/11/2026). Foto grande, nome e "Ver a peça", tudo um link para a página da peça.
 * A foto cresce até a página da peça e volta (ideia 10, retorno de 09/11/2026: "sempre que mostrar um produto"), com um
 * nome próprio (`piece-<slug>`): a mesma peça pode estar na grade logo abaixo, e dois nomes iguais se cancelariam.
 *
 * `compact`: no cabeçalho das páginas de lista (Lançamentos, Designers, Projetos, Corporativo), ao lado do título e
 * da frase: foto pequena à esquerda e, ao lado, o nome, "Peça em destaque" e o convite, sem empurrar a lista para baixo.
 */
export function FeaturePiece({
  product,
  compact = false,
}: {
  product: Pick<ProductCard, 'slug' | 'name' | 'cover'>;
  compact?: boolean;
}) {
  const t = useTranslations('featurePiece');
  const cover = product.cover;
  if (!cover) {
    return null;
  }
  // A foto nunca passa da própria largura: as originais do catálogo são pequenas, e ampliar borra.
  const mediaStyle = cover.width ? ({ '--plate-img-max': `${cover.width}px` } as CSSProperties) : undefined;
  const morph = morphName('piece', product.slug);
  return (
    <aside
      className={compact ? 'feature-piece feature-piece--compact' : 'feature-piece'}
      aria-label={t('label')}
    >
      <Link
        className="feature-piece__link"
        href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
        transitionTypes={morphTypes(morph)}
        data-morph-link={morph}
      >
        <span className="feature-piece__media hover-zoom" style={mediaStyle}>
          <MorphImage
            name={morph}
            image={cover}
            sizes={compact ? COMPACT_SIZES : FEATURE_SIZES}
            fit="contain"
          />
        </span>
        <span className="feature-piece__caption">
          <span className="feature-piece__name">{product.name}</span>
          {compact ? <span className="meta">{t('label')}</span> : null}
          <span className="link-arrow">
            <span>{t('view')}</span>
            <Icon name="arrow" />
          </span>
        </span>
      </Link>
    </aside>
  );
}
