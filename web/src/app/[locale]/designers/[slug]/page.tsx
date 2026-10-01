import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import { MediaLinks } from '@/components/media/MediaLinks';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigner, getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const designers = await getDesigners(params.locale as Locale);
  return designers.map((designer) => ({ slug: designer.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const designer = await getDesigner(locale as Locale, slug);
  if (!designer) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/designers/[slug]', params: { slug } },
    title: designer.seo.title ?? designer.name,
    description: designer.seo.description ?? designer.short_bio,
    image: designer.seo.image ?? designer.portrait,
  });
}

export default async function DesignerPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const designer = await getDesigner(locale, slug);
  if (!designer) {
    notFound();
  }
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'designers' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const links = [
    designer.website_url ? { href: designer.website_url, label: t('website') } : null,
    designer.instagram_url ? { href: designer.instagram_url, label: t('instagram') } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);
  return (
    <main className="wrap">
      <PageHead
        title={designer.name}
        lead={designer.short_bio}
        trail={[{ label: t('title'), href: '/designers' }]}
        meta={designer.location ? <p className="meta">{designer.location}</p> : null}
      />
      <div className="detail-hero">
        <div className="detail-hero__media designer__photo">
          {designer.portrait ? (
            <ApiImage image={designer.portrait} sizes="(max-width: 56.25rem) 100vw, 40vw" priority />
          ) : null}
        </div>
        <div className="detail-hero__copy">
          {designer.bio ? <RichText html={designer.bio} className="prose" /> : null}
          {links.length > 0 ? (
            <ul className="store__links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span>{link.label}</span>
                    <Icon name="arrow" />
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {designer.collections.length > 0 ? (
            <nav className="chips" aria-label={t('collections')}>
              {designer.collections.map((collection) => (
                <Link
                  key={collection.id}
                  className="chip"
                  href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
                >
                  {collection.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
      <MediaLinks
        items={designer.media_links}
        headingId="designer-media"
        className="media-links--wide block"
      />
      {designer.products.length > 0 ? (
        <section aria-labelledby="designer-pieces">
          <h2 id="designer-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={designer.products} />
        </section>
      ) : null}
    </main>
  );
}
