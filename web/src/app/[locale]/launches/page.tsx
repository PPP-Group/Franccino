import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getLaunches } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type LaunchesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LaunchesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.launches' });

  return buildMetadata({ locale: locale as Locale, href: '/launches', title: t('title') });
}

export default async function LaunchesPage({ params }: LaunchesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.launches');
  const tCatalog = await getTranslations('catalog');
  const launches = await getLaunches(locale as Locale);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      {launches.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        <ul>
          {launches.map((launch) => (
            <li key={launch.id}>
              <Link href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
                <ApiImage image={launch.cover} sizes="(min-width: 768px) 33vw, 100vw" />
                <span>{launch.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
