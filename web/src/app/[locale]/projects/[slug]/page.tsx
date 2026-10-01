import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getAllProjectSlugs, getProject } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

const projectHref = (slug: string) => ({ pathname: '/projects/[slug]', params: { slug } }) as const;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const slugs = await getAllProjectSlugs(params.locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(locale as Locale, slug);
  if (!project) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: projectHref(slug),
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    image: project.seo.image ?? project.cover,
    alternates: alternateHrefs(project.slugs, projectHref),
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const project = await getProject(locale, slug);
  if (!project) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: 'projects' });
  const typeLabel = t.has(`types.${project.type}`) ? t(`types.${project.type}`) : project.type;
  return (
    <main className="wrap">
      <PageHead
        title={project.title}
        lead={project.summary}
        trail={[{ label: t('title'), href: '/projects' }]}
        meta={
          <ul className="meta meta-inline num">
            <li>{typeLabel}</li>
            {project.year ? <li>{project.year}</li> : null}
          </ul>
        }
      />
      <div className="detail-hero">
        <div className="detail-hero__media">
          {project.cover ? (
            <ApiImage image={project.cover} sizes="(max-width: 56.25rem) 100vw, 58vw" priority />
          ) : null}
        </div>
        <div className="detail-hero__copy">
          <dl className="facts">
            {project.client_name ? (
              <div>
                <dt>{t('client')}</dt>
                <dd>{project.client_name}</dd>
              </div>
            ) : null}
            {project.architect ? (
              <div>
                <dt>{t('architect')}</dt>
                <dd>{project.architect}</dd>
              </div>
            ) : null}
            {project.location ? (
              <div>
                <dt>{t('location')}</dt>
                <dd>{project.location}</dd>
              </div>
            ) : null}
            {project.year ? (
              <div>
                <dt>{t('year')}</dt>
                <dd className="num">{project.year}</dd>
              </div>
            ) : null}
          </dl>
          {project.description ? <RichText html={project.description} className="prose" /> : null}
        </div>
      </div>
      {project.gallery.length > 0 ? (
        <ul className="gallery-strip" aria-label={t('gallery')}>
          {project.gallery.map((picture) => (
            <li key={picture.id}>
              <ApiImage image={picture} sizes="(max-width: 35rem) 100vw, 33vw" />
            </li>
          ))}
        </ul>
      ) : null}
      {project.products.length > 0 ? (
        <section aria-labelledby="project-pieces" className="section--tight">
          <h2 id="project-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={project.products} />
        </section>
      ) : null}
    </main>
  );
}
