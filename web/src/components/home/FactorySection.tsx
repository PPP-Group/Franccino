import { useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { PageContent } from '@/lib/api/types';
import { heroSizes } from '@/lib/images/cover';
import { morphName, morphTypes } from '@/lib/ui/morph';
import { sectionClass, type Tone } from './tone';

/**
 * Fábrica na home: título, introdução e capa da página `factory` do painel (sem fatos escritos à mão, conflito C4).
 *
 * Rodada 3 (06/11/2026): com capa, uma faixa de foto em largura total, alta, como uma janela: no computador a foto
 * fica parada e a página passa por ela (home.css, sem JavaScript e sem animação presa à rolagem). O texto fica sobre a
 * foto, embaixo à esquerda, e a faixa inteira leva à página da fábrica. Sem capa, a seção de texto com o fundo do tom.
 */
export function FactorySection({ page, tone }: { page: PageContent; tone: Tone }) {
  const t = useTranslations('home.factory');
  const copy = (
    <>
      <h2 id="factory-title">{page.title}</h2>
      {page.intro ? <p className="lead">{page.intro}</p> : null}
      <span className="link-arrow">
        <span>{t('cta')}</span>
        <Icon name="arrow" />
      </span>
    </>
  );
  if (!page.cover) {
    return (
      <section className={sectionClass(tone)} aria-labelledby="factory-title">
        <div className="wrap">
          <Link className="factory-text" href="/factory" data-reveal="">
            {copy}
          </Link>
        </div>
      </section>
    );
  }
  // A foto da faixa cresce até o banner da página da Fábrica e volta (ideia 10, retorno de 09/11/2026).
  const morph = morphName('page', 'factory');
  return (
    <section className="factory-band" aria-labelledby="factory-title">
      <Link
        className="factory-band__link hover-zoom"
        href="/factory"
        data-parallax=""
        transitionTypes={morphTypes(morph)}
        data-morph-link={morph}
      >
        <span className="factory-band__media">
          <MorphImage name={morph} image={page.cover} sizes={heroSizes(page.cover)} />
        </span>
        <div className="wrap factory-band__wrap">
          <div className="factory-band__copy" data-parallax-layer="front" data-reveal="">
            {copy}
          </div>
        </div>
      </Link>
    </section>
  );
}
