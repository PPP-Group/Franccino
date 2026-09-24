import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getFinishes } from '@/lib/api/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

type FinishesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: FinishesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.finishes' });

  return buildMetadata({ locale: locale as Locale, href: '/finishes', title: t('title') });
}

export default async function FinishesPage({ params }: FinishesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.finishes');
  const tCatalog = await getTranslations('catalog');
  const groups = await getFinishes(locale as Locale);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      {groups.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        groups.map((group) => (
          <section key={group.id}>
            <h2>{group.name}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.swatch && <ApiImage image={item.swatch} sizes="64px" />}
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
