import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('errors.notFound');
  return (
    <main className="wrap error-page">
      <div className="empty">
        <h1>{t('title')}</h1>
        <p className="lead">{t('description')}</p>
        <div className="empty__actions">
          <Link className="btn" href="/">
            {t('backHome')}
          </Link>
          <Link className="btn btn--ghost" href="/products">
            {t('catalog')}
          </Link>
        </div>
      </div>
    </main>
  );
}
