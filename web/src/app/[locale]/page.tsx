import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('pages.home');

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  );
}
