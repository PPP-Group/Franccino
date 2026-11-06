import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { SearchParams } from '@/components/catalog/area-pages';
import { Pagination } from '@/components/catalog/Pagination';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { ClientsRail } from '@/components/content/ClientsRail';
import { firstWithCover } from '@/components/content/layout';
import { ProjectRow } from '@/components/content/ProjectRow';
import { PageBanner } from '@/components/layout/PageBanner';
import { FeaturePiece } from '@/components/products/FeaturePiece';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getClients, getHome, getPage, getProjects } from '@/lib/api/content';
import { firstValue, parsePositiveInteger } from '@/lib/api/listing-params';
import { PROJECT_TYPES, parseProjectType, type ProjectType } from '@/lib/projects/type';
import { buildMetadata } from '@/lib/seo/metadata';

/** Qual destaque da home esta página mostra (cada página de lista mostra um diferente). */
const FEATURE_OFFSET = 2;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

const PER_PAGE = 12;

const projectsHref = (type: ProjectType | undefined, page?: number) =>
  ({
    pathname: '/projects',
    query: { ...(type ? { type } : {}), ...(page && page > 1 ? { page: String(page) } : {}) },
  }) as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getPage(locale as Locale, 'projects'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/projects' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro ?? t('description'),
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const query = await searchParams;
  const type = parseProjectType(firstValue(query.type));
  const page = parsePositiveInteger(firstValue(query.page));
  const [t, common, list, content, clients, home] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'common' }),
    getProjects(locale, { type, page, per_page: PER_PAGE }),
    getPage(locale, 'projects'),
    getClients(locale),
    getHome(locale),
  ]);
  // Um destaque da home à direita do título (nada de metade vazia), diferente do das outras páginas de lista.
  const feature = firstWithCover([home.featured_products.slice(FEATURE_OFFSET), home.featured_products]);
  const typeLabel = (value: string) => (t.has(`types.${value}`) ? t(`types.${value}`) : value);
  return (
    <main className="page-end">
      <PageBanner
        image={content?.cover ?? null}
        title={content?.title ?? t('title')}
        lead={content?.intro}
        aside={feature ? <FeaturePiece product={feature} compact /> : null}
      />
      <div className="wrap">
        <nav className="chips project-filter" aria-label={t('typeFilter')}>
          <Link className="chip" href={projectsHref(undefined)} aria-current={type ? undefined : 'true'}>
            {t('allTypes')}
          </Link>
          {PROJECT_TYPES.map((value) => (
            <Link
              key={value}
              className="chip"
              href={projectsHref(value)}
              aria-current={type === value ? 'true' : undefined}
            >
              {typeLabel(value)}
            </Link>
          ))}
        </nav>
        {list.data.length === 0 ? (
          <EmptyNotice text={common('nothingYet')} />
        ) : (
          <div className="project-rows">
            {list.data.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                meta={[
                  typeLabel(project.type),
                  ...(project.location ? [project.location] : []),
                  ...(project.year ? [String(project.year)] : []),
                ]}
                priority={index === 0}
              />
            ))}
          </div>
        )}
        <Pagination meta={list.meta} hrefFor={(next) => projectsHref(type, next)} label={t('pagination')} />
      </div>
      <ClientsRail clients={clients} />
    </main>
  );
}
