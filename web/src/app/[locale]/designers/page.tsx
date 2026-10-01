import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'designers' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/designers' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function DesignersPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, designers] = await Promise.all([
    getTranslations({ locale, namespace: 'designers' }),
    getTranslations({ locale, namespace: 'common' }),
    getDesigners(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead
        title={t('title')}
        lead={t('description')}
        meta={<p className="meta num">{t('count', { count: designers.length })}</p>}
      />
      {designers.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <div className="tiles tiles--four">
          {designers.map((designer, index) => (
            <Tile
              key={designer.id}
              href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
              title={designer.name}
              image={designer.portrait}
              meta={designer.location ? [designer.location] : []}
              text={designer.short_bio}
              portrait
              priority={index < 4}
              sizes="(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 25vw"
            />
          ))}
        </div>
      )}
    </main>
  );
}
