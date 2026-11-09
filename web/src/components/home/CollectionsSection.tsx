import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { morphName, morphTypes } from '@/lib/ui/morph';
import type { CollectionCard } from '@/lib/api/types';
import { sectionClass, type Tone } from './tone';

const SHOWN = 6;

/** Largura desenhada da faixa: a arte não é recortada (segue a proporção dela), então é a largura do bloco. */
const WIDE_SIZES = '(max-width: 97.5rem) 94vw, 1448px';
const HALF_SIZES = '(max-width: 48rem) 94vw, (max-width: 97.5rem) 47vw, 712px';

export type StripSize = 'wide' | 'half';

/**
 * Ritmo das faixas: uma larga e duas lado a lado, de novo uma larga e duas. A meia faixa só entra com par; sem par,
 * a última fica larga. Assim a grade nunca termina com buraco (RODADA3, regra 1).
 */
export function stripLayout(count: number): StripSize[] {
  return Array.from({ length: count }, (_, index) => {
    const position = index % 3;
    if (position === 0) return 'wide';
    const groupEnd = index - position + 2;
    return groupEnd < count ? 'half' : 'wide';
  });
}

/**
 * Coleções da home (rodada 3, retorno de 06/11/2026: "imagens grandes que dão volume"). As capas das coleções são a
 * faixa do marketing (~1920×500, com o nome na arte): aparecem inteiras, na proporção delas, sem recorte, em blocos
 * largos e médios alternados. Nome e número de peças embaixo, como legenda; o hover aproxima a foto.
 */
export function CollectionsSection({ collections, tone }: { collections: CollectionCard[]; tone: Tone }) {
  const t = useTranslations('home.collections');
  const shown = collections.filter((collection) => collection.cover).slice(0, SHOWN);
  const layout = stripLayout(shown.length);
  return (
    <section className={sectionClass(tone)} aria-labelledby="collections-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <h2 id="collections-title">{t('title')}</h2>
          <Link className="link-arrow" href="/collections">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        {/* Cada faixa abre como cortina ao entrar na tela; a segunda meia faixa vem logo depois da primeira. */}
        <ul className="strips">
          {shown.map((collection, index) => {
            const size = layout[index];
            const second = size === 'half' && layout[index - 1] === 'half';
            return (
              <li
                key={collection.id}
                className={`strip strip--${size}`}
                data-reveal="curtain"
                style={second ? ({ '--reveal-index': 1 } as CSSProperties) : undefined}
              >
                <Link
                  className="strip__link"
                  href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
                  transitionTypes={
                    collection.cover ? morphTypes(morphName('collection', collection.slug)) : undefined
                  }
                  data-morph-link={collection.cover ? morphName('collection', collection.slug) : undefined}
                >
                  <span className="strip__media hover-zoom">
                    {collection.cover ? (
                      <MorphImage
                        name={morphName('collection', collection.slug)}
                        image={collection.cover}
                        sizes={size === 'wide' ? WIDE_SIZES : HALF_SIZES}
                      />
                    ) : null}
                  </span>
                  <div className="strip__caption">
                    <h3 className="strip__name">{collection.name}</h3>
                    {collection.product_count > 0 ? (
                      <span className="meta num">{t('pieces', { count: collection.product_count })}</span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
