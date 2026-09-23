'use client';

import { useTranslations } from 'next-intl';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ reset }: LocaleErrorProps) {
  const t = useTranslations('errors.serverError');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button type="button" onClick={reset}>
        {t('retry')}
      </button>
    </main>
  );
}
