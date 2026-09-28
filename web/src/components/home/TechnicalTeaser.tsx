import { useTranslations } from 'next-intl';
import { TechTable } from '@/components/catalog/TechTable';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { TechnicalRow } from '@/lib/catalog/technical';

export function TechnicalTeaser({ rows }: { rows: TechnicalRow[] }) {
  const t = useTranslations('home.technical');
  return (
    <section className="section" aria-labelledby="technical-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="technical-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href={{ pathname: '/products', query: { view: 'table' } }}>
            <span>{t('cta')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <TechTable rows={rows} />
      </div>
    </section>
  );
}
