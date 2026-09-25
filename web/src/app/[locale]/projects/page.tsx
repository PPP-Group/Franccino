import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getProjects } from '@/lib/api/content';
import { isValidationError } from '@/lib/api/errors';
import { firstValue, parsePositiveInteger, type RawSearchParams } from '@/lib/api/listing-params';
import type { Paginated, ProjectCard } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';

const EMPTY_PROJECTS: Paginated<ProjectCard> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
};

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
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
  const rawSearchParams = await searchParams;
  const type = firstValue(rawSearchParams.type);
  const page = parsePositiveInteger(firstValue(rawSearchParams.page));

  let projects: Paginated<ProjectCard>;
  try {
    projects = await getProjects(locale as Locale, { type, page });
  } catch (error) {
    if (!isValidationError(error)) {
      throw error;
    }
    projects = EMPTY_PROJECTS;
  }

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
