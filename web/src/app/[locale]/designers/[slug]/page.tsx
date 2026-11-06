import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CardRail } from '@/components/content/CardRail';
import { neighbours } from '@/components/content/layout';
import { distinctLead } from '@/components/content/lead';
import { RichText } from '@/components/content/RichText';
import { FileDownloads } from '@/components/downloads/FileDownloads';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import { MediaLinks } from '@/components/media/MediaLinks';
import { FeatureCarousel } from '@/components/products/FeatureCarousel';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigner, getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { fitsFeatureCarousel } from '@/lib/ui/feature-carousel';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Quantos designers a faixa "Outros designers" mostra (os seguintes a este na ordem do painel). */
const OTHER_DESIGNERS = 10;

const designerHref = (slug: string) => ({ pathname: '/designers/[slug]', params: { slug } }) as const;

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
    href: designerHref(slug),
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
  const [t, common, designers] = await Promise.all([
    getTranslations({ locale, namespace: 'designers' }),
    getTranslations({ locale, namespace: 'common' }),
    getDesigners(locale),
  ]);
  // Continuidade (rodada 3): o fim da página leva aos próximos designers, sem voltar à lista.
  const others = neighbours(designers, (item) => item.id === designer.id, OTHER_DESIGNERS);
  const links = [
    designer.website_url ? { href: designer.website_url, label: t('website') } : null,
    designer.instagram_url ? { href: designer.instagram_url, label: t('instagram') } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);
  return (
    <main className="page-end">
      <div className="wrap">
        <PageHead
          title={designer.name}
          lead={distinctLead(designer.short_bio, designer.bio)}
          trail={[{ label: t('title'), href: '/designers' }]}
          meta={designer.location ? <p className="meta">{designer.location}</p> : null}
        />
        <div className="detail-hero detail-hero--portrait">
          <div className="detail-hero__media designer__photo">
            {designer.portrait ? (
              <ApiImage image={designer.portrait} sizes="(max-width: 56.25rem) 100vw, 36vw" priority />
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
        <FileDownloads
          files={designer.files}
          title={t('downloads')}
          headingId="designer-downloads"
          className="media-links--wide block"
        />
        <MediaLinks
          items={designer.media_links}
          headingId="designer-media"
          className="media-links--wide block"
        />
        {designer.products.length > 0 ? (
          <section aria-labelledby="designer-pieces" className="page-section">
            <h2 id="designer-pieces" className="section-title">
              {t('piecesTitle')}
            </h2>
            {fitsFeatureCarousel(designer.products.length) ? (
              <FeatureCarousel label={t('piecesTitle')} products={designer.products} />
            ) : (
              <ProductGrid products={designer.products} />
            )}
          </section>
        ) : null}
      </div>
      {others.length > 0 ? (
        <section className="band band--sand" aria-labelledby="other-designers">
          <div className="wrap" data-reveal>
            <h2 id="other-designers" className="section-title">
              {t('othersTitle')}
            </h2>
            <CardRail
              label={t('othersTitle')}
              variant="portrait"
              items={others.map((item) => ({
                id: item.id,
                href: designerHref(item.slug),
                title: item.name,
                image: item.portrait,
              }))}
            />
          </div>
        </section>
      ) : null}
      <RecentlyViewed excludeIds={designer.products.map((product) => product.id)} />
    </main>
  );
}
