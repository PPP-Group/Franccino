import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerDetail } from '@/lib/api/types';
import { ProductPlate, type PlateProduct } from './ProductPlate';
import { MorphImage } from '@/components/media/MorphImage';
import { morphName, morphTypes } from '@/lib/ui/morph';

/** Coluna das peças (5/12 da página, duas lado a lado), com folga para o zoom do hover. */
const PIECE_SIZES = '(max-width: 56.25rem) 48vw, 20vw';

/**
 * Designer da peça. `pieces`: outras peças dele que a página ainda não mostra, à direita do texto (retorno do tech lead
 * de 06/11/2026: a faixa tinha o texto à esquerda e a direita vazia). Sem peças, a faixa fica só com o texto.
 */
export function DesignerStrip({
  designer,
  pieces = [],
}: {
  designer: DesignerDetail;
  pieces?: PlateProduct[];
}) {
  const t = useTranslations('product.designer');
  const classes = ['designer-strip'];
  if (!designer.portrait) classes.push('designer-strip--text');
  if (pieces.length > 0) classes.push('designer-strip--pieces');
  return (
    <section className="section section--paper section--tight" aria-labelledby="designer-title">
      <div className="wrap">
        <div className={classes.join(' ')}>
          {designer.portrait ? (
            <MorphImage name={morphName('designer', designer.slug)} image={designer.portrait} sizes="160px" />
          ) : null}
          <div className="designer-strip__copy">
            <h2 id="designer-title">{designer.name}</h2>
            {designer.short_bio ? <p className="lead">{designer.short_bio}</p> : null}
            <div>
              <Link
                className="link-arrow"
                href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
                transitionTypes={
                  designer.portrait ? morphTypes(morphName('designer', designer.slug)) : undefined
                }
                data-morph-link={designer.portrait ? morphName('designer', designer.slug) : undefined}
              >
                <span>{t('piecesBy', { name: designer.name })}</span>
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
          {pieces.length > 0 ? (
            <ul className="designer-strip__pieces" aria-label={t('piecesBy', { name: designer.name })}>
              {pieces.map((piece) => (
                <li key={piece.id}>
                  <ProductPlate product={piece} sizes={PIECE_SIZES} morphScope="designer" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
