import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('errors.notFound');

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Link href="/">{t('backHome')}</Link>
    </main>
  );
}
