import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { RichText } from '@/components/content/RichText';
import { ContactForm } from '@/components/forms/ContactForm';
import { BackLink } from '@/components/products/BackLink';
import { DesignerStrip } from '@/components/products/DesignerStrip';
import { DimensionsBlock } from '@/components/products/DimensionsBlock';
import { ProductConfigurator } from '@/components/products/ProductConfigurator';
import { ProductRail } from '@/components/products/ProductRail';
import { ProductStage } from '@/components/products/ProductStage';
import { ClampedText } from '@/components/ui/ClampedText';
import { ProductColors } from '@/components/products/ProductColors';
import { ProductVariants } from '@/components/products/ProductVariants';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { TrackView } from '@/components/recent/TrackView';
import { JsonLd } from '@/components/seo/JsonLd';
import { AreaDot } from '@/components/ui/AreaDot';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import { FileDownloads } from '@/components/downloads/FileDownloads';
import { programOf, TechnicalLibrary } from '@/components/downloads/TechnicalLibrary';
import { MediaLinks } from '@/components/media/MediaLinks';
import { LeadSource } from '@/components/products/LeadSource';
import { locales, type Locale } from '@/i18n/config';
import { getPathname, Link, type AppHref } from '@/i18n/navigation';
import { getAllProductSlugs, getProduct } from '@/lib/api/catalog';
import { getDesigner, getSettings } from '@/lib/api/content';
import type { ProductDetail } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';
import { toProductCard } from '@/lib/catalog/card';
import { galleryImages } from '@/lib/product/gallery';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, alternateHrefs, buildMetadata, type Href } from '@/lib/seo/metadata';
import { productMorphName } from '@/components/products/ProductPlate';

type Props = { params: Promise<{ locale: string; slug: string }> };

/**
 * Endereços das listagens que contêm a peça: um link para qualquer uma delas, na página da peça, leva a foto até o
 * primeiro lugar da lista (retorno de 13/11/2026).
 */
function leadPaths(product: ProductDetail, locale: Locale): string[] {
  const hrefs: AppHref[] = [
    areaPath(product.area.key),
    categoryHref(product),
    '/products',
    ...product.collections.map(
      (collection) => ({ pathname: '/collections/[slug]', params: { slug: collection.slug } }) as const,
    ),
    ...(product.designer
      ? [{ pathname: '/designers/[slug]', params: { slug: product.designer.slug } } as const]
      : []),
    ...(product.is_new ? ['/launches' as const] : []),
  ];
  const all = getPathname({ href: '/products', locale });
  // A lista de todas as peças filtrada pela categoria da peça (o menu Produtos do topo leva para ela).
  const byCategory = `${all}?category=${encodeURIComponent(product.category.slug)}`;
  return [...hrefs.map((href) => getPathname({ href: href as Href, locale })), byCategory];
}

const productHref = (slug: string) => ({ pathname: '/products/[slug]', params: { slug } }) as const;

/**
 * O endereço da peça neste idioma quando `slug` é o endereço dela em outro idioma (o `/en` recebia o link em português
 * de "Peças que você viu" e abria uma página de erro; retorno de 16/11/2026).
 */
async function localizedSlug(slug: string, locale: Locale): Promise<string | null> {
  for (const other of locales.filter((item) => item !== locale)) {
    const found = await getProduct(other, slug);
    const target = found?.slugs[locale];
    if (target && target !== slug) return target;
  }
  return null;
}

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
    // Endereço da peça no outro idioma (um link salvo antes da troca de idioma): leva ao endereço deste idioma.
    const localized = await localizedSlug(slug, locale);
    if (localized) redirect(getPathname({ href: productHref(localized), locale }));
    notFound();
  }
  const designerRef = product.designer;
  const [t, common, nav, settings, designer] = await Promise.all([
    getTranslations({ locale, namespace: 'product' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
    getSettings(locale),
    designerRef ? getDesigner(locale, designerRef.slug) : Promise.resolve(null),
  ]);

  const crumbs: BreadcrumbItem[] = [
    { label: common('home'), href: '/' },
    { label: nav(product.area.key), href: areaPath(product.area.key) },
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
  // Cada peça aparece uma vez só na página: a foto dela é o alvo da transição do card (ideia 10), e dois cards com o
  // mesmo nome cancelariam a transição.
  const shown = new Set([product.id, ...product.line_products.map((item) => item.id)]);
  const related = product.related.filter((item) => !shown.has(item.id));
  // "Peças que você viu" no fim não repete a peça aberta nem as das esteiras acima.
  const onPage = [...shown, ...related.map((item) => item.id)];
  const card = toProductCard(product);
  // Conteúdo sem tradução volta em português (locale_fallback): marcar o idioma para leitores de tela.
  const contentLang = product.locale_fallback && locale !== 'pt' ? 'pt-BR' : undefined;

  return (
    <main>
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd data={breadcrumb} />
      <TrackView product={card} locale={locale} slugs={product.slugs} />
      <div className="wrap">
        <div className="product-top">
          <BackLink fallback={categoryHref(product)} />
          <Breadcrumbs label={common('breadcrumb')} items={crumbs} />
        </div>
        {product.cover ? (
          <LeadSource card={card} morph={productMorphName(product.slug)} paths={leadPaths(product, locale)} />
        ) : null}
        <div className="product">
          <ProductStage
            images={galleryImages(product)}
            name={product.name}
            slug={product.slug}
            model={product.model_3d}
          />
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
              {product.tagline ? (
                <p className="lead" lang={contentLang}>
                  {product.tagline}
                </p>
              ) : null}
              {contentLang ? <p className="meta">{t('fallbackNotice')}</p> : null}
            </div>

            {/*
              Descrição e materiais em seções com título, como Acabamentos e Medidas (retorno de 17/11/2026: só o "Ver
              mais" não dizia do que era o texto). No celular elas vêm depois do botão da lista (product.css).
            */}
            {product.description ? (
              <section className="product-about block" aria-labelledby="product-about-title">
                <div className="block__title">
                  <h2 id="product-about-title">{t('about')}</h2>
                </div>
                <div lang={contentLang}>
                  <ClampedText lines={4}>
                    <RichText html={product.description} className="prose" />
                  </ClampedText>
                </div>
              </section>
            ) : null}

            {/*
              Materiais com a nota de acabamento da peça logo embaixo: toda a descrição num lugar só (revisão da
              Franccino, 18/11/2026: parte do texto aparecia sob Acabamentos).
            */}
            {product.materials || product.finishes_note ? (
              <section className="product-about block" aria-labelledby="product-materials-title">
                <div className="block__title">
                  <h2 id="product-materials-title">{t('materials')}</h2>
                </div>
                <div lang={contentLang}>
                  <ClampedText lines={3} className="meta">
                    {product.materials ? <p>{product.materials}</p> : null}
                    {product.finishes_note ? <p>{product.finishes_note}</p> : null}
                  </ClampedText>
                </div>
              </section>
            ) : null}

            <ProductColors product={card} />

            <ProductVariants variants={product.variants ?? []} />

            <ProductConfigurator
              product={{ ...card, finishes: product.finishes }}
              whatsapp={settings.quotes_whatsapp}
              finishesNote={null}
              quoteForm={<ContactForm type="quote" productId={product.id} submitLabel={t('sendQuote')} />}
            >
              <DimensionsBlock dimensions={product.dimensions} />
            </ProductConfigurator>

            <TechnicalLibrary files={product.files} productName={product.name} />

            <FileDownloads
              files={product.files.filter((file) => programOf(file) === null)}
              title={t('downloads.title')}
            />

            <MediaLinks items={product.media_links} headingId="product-media" />
          </div>
        </div>
      </div>

      {/*
        Seções de continuidade com o fundo alternado (areia, branco...), como na home: cada uma fica separada da
        outra (retorno do tech lead de 06/11/2026: "tudo no branco"). A alternância é do CSS (`.tone-stack`), então
        a seção que some não quebra a sequência.
      */}
      <div className="tone-stack tone-stack--paper">
        {/* Só o designer, sem as fotos das peças dele (revisão da Franccino, 18/11/2026). */}
        {designer ? <DesignerStrip designer={designer} pieces={[]} /> : null}

        {product.line_products.length > 0 ? (
          <section className="section" aria-labelledby="line-title">
            <div className="wrap" data-reveal>
              <div className="section-head">
                <h2 id="line-title">
                  {product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
                </h2>
              </div>
              <ProductRail
                label={product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
                products={product.line_products}
                scope="line"
              />
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="section" aria-labelledby="related-title">
            <div className="wrap" data-reveal>
              <div className="section-head">
                <h2 id="related-title">{t('related', { category: product.category.name })}</h2>
                <Link className="link-arrow" href={areaPath(product.area.key)}>
                  <span>{t('seeArea', { area: product.area.brand_name })}</span>
                  <Icon name="arrow" />
                </Link>
              </div>
              <ProductRail
                label={t('related', { category: product.category.name })}
                products={related}
                scope="related"
              />
            </div>
          </section>
        ) : null}

        <RecentlyViewed excludeIds={onPage} />
      </div>
    </main>
  );
}
