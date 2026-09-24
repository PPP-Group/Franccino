import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getProjects } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
};

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.projects' });

  return buildMetadata({ locale: locale as Locale, href: '/projects', title: t('title') });
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.projects');
  const tCatalog = await getTranslations('catalog');
  const { type, page: pageParam } = await searchParams;
  const page = Number(pageParam);

  const projects = await getProjects(locale as Locale, {
    type,
    page: Number.isInteger(page) && page > 0 ? page : undefined,
  });

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      {projects.data.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        <ul>
          {projects.data.map((project) => (
            <li key={project.id}>
              <Link href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}>
                <ApiImage image={project.cover} sizes="(min-width: 768px) 33vw, 100vw" />
                <span>{project.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
