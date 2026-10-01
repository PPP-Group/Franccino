import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
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
  const [t, common, page, projects, clients] = await Promise.all([
    getTranslations({ locale, namespace: 'corporate' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'corporate'),
    getProjects(locale, { type: 'corporate', per_page: 12 }),
    getClients(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      {page?.cover ? <ApiImage image={page.cover} sizes="100vw" priority className="page-cover" /> : null}
      {page ? <Blocks blocks={page.content} /> : null}
      {projects.data.length > 0 ? (
        <section aria-labelledby="corporate-projects">
          <h2 id="corporate-projects" className="section-title">
            {t('projects')}
          </h2>
          <div className="tiles">
            {projects.data.map((project) => (
              <Tile
                key={project.id}
                href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
                title={project.title}
                image={project.cover}
                meta={[
                  ...(project.client_name ? [project.client_name] : []),
                  ...(project.year ? [String(project.year)] : []),
                ]}
                text={project.summary}
                headingLevel="h3"
              />
            ))}
          </div>
        </section>
      ) : null}
      {clients.length > 0 ? (
        <section aria-labelledby="corporate-clients">
          <h2 id="corporate-clients" className="section-title">
            {t('clients')}
          </h2>
          <ul className="logo-wall">
            {clients.map((client) => {
              const mark = client.logo ? (
                <ApiImage image={client.logo} sizes="160px" />
              ) : (
                <span>{client.name}</span>
              );
              return (
                <li key={client.id}>
                  {client.url ? (
                    <a href={client.url} target="_blank" rel="noopener noreferrer" aria-label={client.name}>
                      {mark}
                      <span className="visually-hidden">{common('opensInNewWindow')}</span>
                    </a>
                  ) : (
                    mark
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
