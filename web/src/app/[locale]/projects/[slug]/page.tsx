import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { distinctLead } from '@/components/content/lead';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getAllProjectSlugs, getProject } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Galeria em 3 colunas (2 no tablet, 1 no celular), com o recorte 4:3 de `.gallery-strip`. */
const GALLERY_SIZES = '(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 33vw';

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
  // Fatos só com o que foi cadastrado; sem nenhum, a lista some (antes sobrava o fio de cima). O ano já está no
  // metadado ao lado do título.
  const facts = [
    { key: 'client', value: project.client_name },
    { key: 'architect', value: project.architect },
    { key: 'location', value: project.location },
  ].filter((fact): fact is { key: 'client' | 'architect' | 'location'; value: string } =>
    Boolean(fact.value),
  );
  return (
    <main className="wrap page-end">
      <PageHead
        title={project.title}
        lead={distinctLead(project.summary, project.description)}
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
          {facts.length > 0 ? (
            <dl className="facts">
              {facts.map((fact) => (
                <div key={fact.key}>
                  <dt>{t(fact.key)}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {project.description ? <RichText html={project.description} className="prose" /> : null}
        </div>
      </div>
      {project.gallery.length > 0 ? (
        <ul className="gallery-strip" aria-label={t('gallery')}>
          {project.gallery.map((picture) => (
            <li key={picture.id}>
              <ApiImage image={picture} sizes={GALLERY_SIZES} />
            </li>
          ))}
        </ul>
      ) : null}
      {project.products.length > 0 ? (
        <section aria-labelledby="project-pieces" className="page-section">
          <h2 id="project-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={project.products} />
        </section>
      ) : null}
    </main>
  );
}
