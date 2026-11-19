import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerCard } from '@/lib/api/types';
import { morphName, morphTypes } from '@/lib/ui/morph';
import { sectionClass, type Tone } from './tone';

/** Largura desenhada do retrato na faixa (motion.css e home.css: 15rem no computador, 10rem no celular). */
const PORTRAIT_SIZES = '(max-width: 35rem) 160px, 240px';

/** Ordem alfabética: na faixa ninguém vem "primeiro" (reunião de 18/11/2026). */
export function designersInRail(designers: DesignerCard[]): DesignerCard[] {
  return [...designers].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

/**
 * Designers da home: só retrato e nome. Reunião com a Franccino (18/11/2026): no lugar de 4 retratos fixos, que davam a
 * ideia de que uns designers valem mais que outros, todos passam numa faixa em loop contínuo, em ordem alfabética, como a
 * faixa de clientes (para no hover; parada e rolável com movimento reduzido). Cada retrato abre a página do designer.
 * A segunda cópia da faixa (para o loop sem emenda) fica fora do leitor de tela e do teclado, sem o nome do movimento.
 */
export function DesignersSection({ designers, tone }: { designers: DesignerCard[]; tone: Tone }) {
  const t = useTranslations('home.designers');
  const sorted = designersInRail(designers);
  const items = (copy: number) =>
    sorted.map((designer) => {
      const name = morphName('designer', designer.slug);
      const morph = copy === 0 && designer.portrait ? name : undefined;
      return (
        <li key={`${copy}-${designer.id}`} className="designer-rail__item">
          <Link
            className="designer"
            href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
            transitionTypes={morph ? morphTypes(morph) : undefined}
            data-morph-link={morph}
            tabIndex={copy === 0 ? undefined : -1}
          >
            <div className="designer__photo hover-zoom">
              {designer.portrait ? (
                morph ? (
                  <MorphImage name={morph} image={designer.portrait} sizes={PORTRAIT_SIZES} />
                ) : (
                  <ApiImage image={{ ...designer.portrait, alt: '' }} sizes={PORTRAIT_SIZES} />
                )
              ) : null}
            </div>
            <h3>{designer.name}</h3>
          </Link>
        </li>
      );
    });
  return (
    <section className={sectionClass(tone)} aria-labelledby="designers-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <div>
            <h2 id="designers-title">{t('title')}</h2>
          </div>
          <Link className="link-arrow" href="/designers">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <div className="designer-rail" data-reveal="">
        <div className="designer-rail__track" style={{ '--rail-count': sorted.length } as CSSProperties}>
          <ul className="designer-rail__list">{items(0)}</ul>
          <ul className="designer-rail__list" aria-hidden="true">
            {items(1)}
          </ul>
        </div>
      </div>
    </section>
  );
}
