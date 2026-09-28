import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigner, getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type DesignerPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const designers = await getDesigners(params.locale as Locale);
  return designers.map((designer) => ({ slug: designer.slug }));
}

export async function generateMetadata({ params }: DesignerPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.designerDetail' });
  const designer = await getDesigner(locale as Locale, slug);

  if (!designer) {
    return buildMetadata({
      locale: locale as Locale,
      href: { pathname: '/designers/[slug]', params: { slug } },
      title: t('title'),
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/designers/[slug]', params: { slug } },
    title: designer.seo.title ?? designer.name,
    description: designer.seo.description ?? designer.short_bio,
    image: designer.seo.image ?? designer.portrait,
  });
}

export default async function DesignerPage({ params }: DesignerPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sections');
  const designer = await getDesigner(locale as Locale, slug);

  if (!designer) {
    notFound();
  }

  return (
    <main id="main-content">
      <h1>{designer.name}</h1>
      <ApiImage image={designer.portrait} sizes="(min-width: 768px) 33vw, 100vw" priority />
      {designer.bio && <RichText html={designer.bio} />}

      <ul>
        {designer.website_url && (
          <li>
            <a href={designer.website_url}>{designer.website_url}</a>
          </li>
        )}
        {designer.instagram_url && (
          <li>
            <a href={designer.instagram_url}>{designer.instagram_url}</a>
          </li>
        )}
      </ul>

      {designer.collections.length > 0 && (
        <section>
          <h2>{t('collections')}</h2>
          <ul>
            {designer.collections.map((collection) => (
              <li key={collection.id}>
                <Link href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}>
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {designer.products.length > 0 && (
        <section>
          <h2>{t('products')}</h2>
          <ProductGrid products={designer.products} />
        </section>
      )}
    </main>
  );
}
