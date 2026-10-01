'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ reset }: LocaleErrorProps) {
  const t = useTranslations('errors.serverError');
  const notFound = useTranslations('errors.notFound');

  return (
    <main className="wrap error-page">
      <div className="empty">
        <h1>{t('title')}</h1>
        <p className="lead">{t('description')}</p>
        <div className="empty__actions">
          <button className="btn" type="button" onClick={reset}>
            {t('retry')}
          </button>
          <Link className="btn btn--ghost" href="/">
            {notFound('backHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
