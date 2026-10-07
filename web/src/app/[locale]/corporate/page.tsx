import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { ClientsRail } from '@/components/content/ClientsRail';
import { ProjectRow } from '@/components/content/ProjectRow';
import { PageBanner } from '@/components/layout/PageBanner';
import type { Locale } from '@/i18n/config';
import { getClients, getPage, getProjects } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'corporate' }),
    getPage(locale as Locale, 'corporate'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/corporate' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function CorporatePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page, projects, clients] = await Promise.all([
    getTranslations({ locale, namespace: 'corporate' }),
    getPage(locale, 'corporate'),
    getProjects(locale, { type: 'corporate', per_page: 12 }),
    getClients(locale),
  ]);
  return (
    <main>
      <PageBanner image={page?.cover ?? null} title={page?.title ?? t('title')} lead={page?.intro} />
      <div className="wrap">
        {page ? <Blocks blocks={page.content} /> : null}
        {projects.data.length > 0 ? (
          <section aria-labelledby="corporate-projects">
            <h2 id="corporate-projects" className="section-title">
              {t('projects')}
            </h2>
            <div className="project-rows">
              {projects.data.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  meta={[
                    ...(project.client_name ? [project.client_name] : []),
                    ...(project.location ? [project.location] : []),
                    ...(project.year ? [String(project.year)] : []),
                  ]}
                />
              ))}
            </div>
          </section>
        ) : null}
        <ClientsRail clients={clients} />
      </div>
    </main>
  );
}
