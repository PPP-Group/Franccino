import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerCard } from '@/lib/api/types';
import { sectionClass, type Tone } from './tone';

const SHOWN = 4;

/** Quantos retratos a linha mostra: 4 com 4 ou mais; com menos, todos (a grade tem uma coluna por retrato). */
export function designersShown(available: number): number {
  return Math.min(SHOWN, available);
}

/** Largura desenhada do retrato: 2 colunas no celular e no tablet, 4 no computador (grade de até 1448px). */
const PORTRAIT_SIZES = '(max-width: 56.25rem) 46vw, (max-width: 97.5rem) 23vw, 360px';

/**
 * Designers da home: só retrato e nome, como os cards de peça (revisão de 06/11/2026). A biografia, de tamanho
 * diferente em cada um, desalinhava a linha; ela continua na página do designer. Rodada 3: a linha é sempre
 * completa (uma coluna por retrato quando há menos de 4) e o hover aproxima o retrato.
 */
export function DesignersSection({ designers, tone }: { designers: DesignerCard[]; tone: Tone }) {
  const t = useTranslations('home.designers');
  const shown = designers.slice(0, designersShown(designers.length));
  return (
    <section className={sectionClass(tone)} aria-labelledby="designers-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <div>
            <h2 id="designers-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href="/designers">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <div className={`designers designers--${shown.length}`} data-reveal="curtain-stagger">
          {shown.map((designer) => (
            <Link
              key={designer.id}
              className="designer"
              href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
            >
              <div className="designer__photo hover-zoom">
                {designer.portrait ? <ApiImage image={designer.portrait} sizes={PORTRAIT_SIZES} /> : null}
              </div>
              <h3>{designer.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
