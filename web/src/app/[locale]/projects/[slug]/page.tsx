import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getProject, getProjects } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const projects = await getProjects(params.locale as Locale, { per_page: 48 });
  return projects.data.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.projectDetail' });
  const project = await getProject(locale as Locale, slug);

  if (!project) {
    return buildMetadata({
      locale: locale as Locale,
      href: { pathname: '/projects/[slug]', params: { slug } },
      title: t('title'),
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/projects/[slug]', params: { slug } },
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    image: project.seo.image ?? project.cover,
    alternates: alternateHrefs(project.slugs, (slug) => ({ pathname: '/projects/[slug]', params: { slug } })),
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sections');
  const project = await getProject(locale as Locale, slug);

  if (!project) {
    notFound();
  }

  return (
    <main id="main-content">
      <h1>{project.title}</h1>
      {project.description && <RichText html={project.description} />}

      {project.gallery.length > 0 && (
        <section>
          <h2>{t('gallery')}</h2>
          <ul>
            {project.gallery.map((image) => (
              <li key={image.id}>
                <ApiImage image={image} sizes="(min-width: 768px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.products.length > 0 && (
        <section>
          <h2>{t('products')}</h2>
          <ProductGrid products={project.products} />
        </section>
      )}
    </main>
  );
}
