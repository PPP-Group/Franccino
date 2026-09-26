import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type DesignersPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DesignersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.designers' });

  return buildMetadata({ locale: locale as Locale, href: '/designers', title: t('title') });
}

export default async function DesignersPage({ params }: DesignersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.designers');
  const tCatalog = await getTranslations('catalog');
  const designers = await getDesigners(locale as Locale);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      {designers.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        <ul>
          {designers.map((designer) => (
            <li key={designer.id}>
              <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                <ApiImage image={designer.portrait} sizes="(min-width: 768px) 25vw, 50vw" />
                <span>{designer.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
