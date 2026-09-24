import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { ContactForm } from '@/components/forms/ContactForm';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { ModelViewer } from '@/components/products/ModelViewer';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { getProduct, getProducts } from '@/lib/api/catalog';
import { formatDimension } from '@/lib/format/dimensions';
import { absoluteUrl, buildMetadata, type Href } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld';

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const products = await getProducts(params.locale as Locale, { per_page: 48 });
  return products.data.map((product) => ({ slug: product.slug }));
}

function alternateHrefs(slugs: Record<Locale, string | null>): Partial<Record<Locale, Href | null>> {
  const alternates: Partial<Record<Locale, Href | null>> = {};
  for (const locale of locales) {
    const slug = slugs[locale];
    alternates[locale] = slug ? { pathname: '/products/[slug]', params: { slug } } : null;
  }
  return alternates;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.productDetail' });
  const product = await getProduct(locale as Locale, slug);

  if (!product) {
    return buildMetadata({
      locale: locale as Locale,
      href: { pathname: '/products/[slug]', params: { slug } },
      title: t('title'),
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/products/[slug]', params: { slug } },
    title: product.seo.title ?? product.name,
    description: product.seo.description ?? product.tagline,
    image: product.seo.image ?? product.cover,
    alternates: alternateHrefs(product.slugs),
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('products');
  const tDimensions = await getTranslations('dimensions');
  const product = await getProduct(locale as Locale, slug);

  if (!product) {
    notFound();
  }

  const url = absoluteUrl(
    getPathname({ href: { pathname: '/products/[slug]', params: { slug } }, locale: locale as Locale }),
  );
  const dimensionLabels = {
    width: tDimensions('width'),
    depth: tDimensions('depth'),
    height: tDimensions('height'),
    seatHeight: tDimensions('seatHeight'),
    diameter: tDimensions('diameter'),
  };

  return (
    <main id="main-content">
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd data={breadcrumbJsonLd([{ name: product.name, url }])} />

      <h1>{product.name}</h1>
      {product.tagline && <p>{product.tagline}</p>}

      {product.gallery.length > 0 && (
        <ul>
          {product.gallery.map((image) => (
            <li key={image.id}>
              <ApiImage image={image} sizes="(min-width: 768px) 50vw, 100vw" />
            </li>
          ))}
        </ul>
      )}

      <ModelViewer model3d={product.model_3d} alt={product.name} />

      {product.description && <RichText html={product.description} />}

      {product.dimensions.length > 0 && (
        <section>
          <h2>{t('dimensionsHeading')}</h2>
          <ul>
            {product.dimensions.map((dimension, index) => (
              <li key={index}>{formatDimension(dimension, locale as Locale, dimensionLabels)}</li>
            ))}
          </ul>
        </section>
      )}

      {product.materials && (
        <section>
          <h2>{t('materialsHeading')}</h2>
          <p>{product.materials}</p>
        </section>
      )}

      {product.finishes.length > 0 && (
        <section>
          <h2>{t('finishesHeading')}</h2>
          {product.finishes.map((group) => (
            <div key={group.group}>
              <h3>{group.group}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    {item.swatch && <ApiImage image={item.swatch} sizes="64px" />}
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {product.finishes_note && <p>{product.finishes_note}</p>}
        </section>
      )}

      {product.files.length > 0 && (
        <section>
          <h2>{t('filesHeading')}</h2>
          <ul>
            {product.files.map((file) => (
              <li key={file.id}>
                <span>{file.title}</span>
                <DownloadButton fileId={file.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.line_products.length > 0 && (
        <section>
          <h2>{t('lineProductsHeading')}</h2>
          <ProductGrid products={product.line_products} />
        </section>
      )}

      {product.related.length > 0 && (
        <section>
          <h2>{t('relatedProducts')}</h2>
          <ProductGrid products={product.related} />
        </section>
      )}

      <section>
        <h2>{t('quoteHeading')}</h2>
        <ContactForm productId={product.id} fixedType="quote" />
      </section>
    </main>
  );
}
