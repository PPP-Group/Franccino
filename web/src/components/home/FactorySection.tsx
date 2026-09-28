import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { PageContent } from '@/lib/api/types';

/** Título, introdução e capa da página `factory` do painel (sem fatos escritos à mão, conflito C4). */
export function FactorySection({ page }: { page: PageContent }) {
  const t = useTranslations('home.factory');
  return (
    <section className="section section--paper" aria-labelledby="factory-title">
      <div className="wrap factory">
        <div className="factory__media">
          {page.cover ? <ApiImage image={page.cover} sizes="(max-width: 56.25rem) 100vw, 50vw" /> : null}
        </div>
        <div className="factory__copy">
          <h2 id="factory-title">{page.title}</h2>
          {page.intro ? <p className="lead">{page.intro}</p> : null}
          <div>
            <Link className="link-arrow" href="/factory">
              <span>{t('cta')}</span>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
