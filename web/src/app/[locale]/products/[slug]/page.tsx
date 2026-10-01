import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/content/RichText';
import { ContactForm } from '@/components/forms/ContactForm';
import { DesignerStrip } from '@/components/products/DesignerStrip';
import { DimensionsBlock } from '@/components/products/DimensionsBlock';
import { ProductConfigurator } from '@/components/products/ProductConfigurator';
import { ProductRail } from '@/components/products/ProductRail';
import { ProductStage } from '@/components/products/ProductStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { AreaDot } from '@/components/ui/AreaDot';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import { FileDownloads } from '@/components/downloads/FileDownloads';
import { MediaLinks } from '@/components/media/MediaLinks';
import type { Locale } from '@/i18n/config';
import { getPathname, Link, type AppHref } from '@/i18n/navigation';
import { getAllProductSlugs, getProduct } from '@/lib/api/catalog';
import { getDesigner, getSettings } from '@/lib/api/content';
import type { ProductDetail } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';
import { toProductCard } from '@/lib/catalog/card';
import { galleryImages } from '@/lib/product/gallery';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, alternateHrefs, buildMetadata, type Href } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

const productHref = (slug: string) => ({ pathname: '/products/[slug]', params: { slug } }) as const;

function categoryHref(product: ProductDetail): AppHref {
  const params = { category: product.category.slug };
  return product.area.key === 'outdoor'
    ? { pathname: '/outdoor/[category]', params }
    : { pathname: '/indoor/[category]', params };
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const slugs = await getAllProductSlugs(params.locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(locale as Locale, slug);
  if (!product) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: productHref(slug),
    title: product.seo.title ?? product.name,
    description: product.seo.description ?? product.tagline,
    image: product.seo.image ?? product.cover,
    alternates: alternateHrefs(product.slugs, productHref),
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const product = await getProduct(locale, slug);
  if (!product) {
    notFound();
  }
  const designerRef = product.designer;
  const [t, common, settings, designer] = await Promise.all([
    getTranslations({ locale, namespace: 'product' }),
    getTranslations({ locale, namespace: 'common' }),
    getSettings(locale),
    designerRef ? getDesigner(locale, designerRef.slug) : Promise.resolve(null),
  ]);

  const crumbs: BreadcrumbItem[] = [
    { label: common('home'), href: '/' },
    { label: product.area.brand_name, href: areaPath(product.area.key) },
    { label: product.category.name, href: categoryHref(product) },
    { label: product.name },
  ];
  const url = absoluteUrl(getPathname({ href: productHref(slug), locale }));
  const breadcrumb = breadcrumbJsonLd(
    crumbs.map((crumb) => ({
      name: crumb.label,
      url: crumb.href ? absoluteUrl(getPathname({ href: crumb.href as Href, locale })) : url,
    })),
  );
  // Conteúdo sem tradução volta em português (locale_fallback): marcar o idioma para leitores de tela.
  const contentLang = product.locale_fallback && locale !== 'pt' ? 'pt-BR' : undefined;

  return (
    <main>
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd data={breadcrumb} />
      <div className="wrap">
        <Breadcrumbs label={common('breadcrumb')} items={crumbs} />
        <div className="product">
          <ProductStage images={galleryImages(product)} name={product.name} model={product.model_3d} />
          <div className="panel">
            <div className="panel__head">
              <h1>{product.name}</h1>
              <ul className="meta meta-inline">
                <li>{product.category.singular_name}</li>
                <li>
                  <AreaDot area={product.area.key} />
                  {product.area.brand_name}
                </li>
                {designerRef ? (
                  <li>
                    {t.rich('designBy', {
                      name: designerRef.name,
                      designer: (chunks) => (
                        <Link href={{ pathname: '/designers/[slug]', params: { slug: designerRef.slug } }}>
                          {chunks}
                        </Link>
                      ),
                    })}
                  </li>
                ) : null}
                {product.sku ? <li className="num">{t('sku', { sku: product.sku })}</li> : null}
              </ul>
              <div className="panel__copy" lang={contentLang}>
                {product.tagline ? <p className="lead">{product.tagline}</p> : null}
                {product.description ? <RichText html={product.description} className="prose" /> : null}
                {product.materials ? (
                  <p className="meta">{t('materials', { materials: product.materials })}</p>
                ) : null}
              </div>
              {contentLang ? <p className="meta">{t('fallbackNotice')}</p> : null}
            </div>

            <ProductConfigurator
              product={{ ...toProductCard(product), finishes: product.finishes }}
              whatsapp={settings.quotes_whatsapp}
              finishesNote={product.finishes_note}
            >
              <DimensionsBlock dimensions={product.dimensions} />
            </ProductConfigurator>

            <FileDownloads files={product.files} title={t('downloads.title')} />

            <MediaLinks items={product.media_links} headingId="product-media" />

            <details className="quote-inline block">
              <summary>{t('quoteOnlyThis')}</summary>
              <ContactForm type="quote" productId={product.id} submitLabel={t('sendQuote')} />
            </details>
          </div>
        </div>
      </div>

      {designer ? <DesignerStrip designer={designer} /> : null}

      {product.line_products.length > 0 ? (
        <section className="section" aria-labelledby="line-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="line-title">
                {product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
              </h2>
            </div>
            <ProductRail
              label={product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
              products={product.line_products}
            />
          </div>
        </section>
      ) : null}

      {product.related.length > 0 ? (
        <section className="section" aria-labelledby="related-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="related-title">{t('related', { category: product.category.name })}</h2>
              <Link className="link-arrow" href={areaPath(product.area.key)}>
                <span>{t('seeArea', { area: product.area.brand_name })}</span>
                <Icon name="arrow" />
              </Link>
            </div>
            <ProductRail
              label={t('related', { category: product.category.name })}
              products={product.related}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
