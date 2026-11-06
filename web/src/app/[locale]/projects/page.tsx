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
import { getClients, getHome, getPage, getProjects } from '@/lib/api/content';
import { firstValue, parsePositiveInteger } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

/** Qual destaque da home esta página mostra (cada página de lista mostra um diferente). */
const FEATURE_OFFSET = 2;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

const PER_PAGE = 12;

/**
 * A área de projetos é só "Corporativo" (pedido do Pedro Ivo, 06/11/2026): sem filtro de tipo, só os projetos
 * corporativos, e o título é sempre o do site (o do painel ainda diz "Projetos").
 */
const PROJECT_TYPE = 'corporate';

const projectsHref = (page?: number) =>
  ({
    pathname: '/projects',
    query: page && page > 1 ? { page: String(page) } : {},
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
    title: t('title'),
    description: page?.seo.description ?? page?.intro ?? t('description'),
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const query = await searchParams;
  const page = parsePositiveInteger(firstValue(query.page));
  const [t, common, list, content, clients, home] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'common' }),
    getProjects(locale, { type: PROJECT_TYPE, page, per_page: PER_PAGE }),
    getPage(locale, 'projects'),
    getClients(locale),
    getHome(locale),
  ]);
  // Um destaque da home à direita do título (nada de metade vazia), diferente do das outras páginas de lista.
  const feature = firstWithCover([home.featured_products.slice(FEATURE_OFFSET), home.featured_products]);
  return (
    <main className="page-end">
      <PageBanner
        image={content?.cover ?? null}
        title={t('title')}
        lead={content?.intro}
        aside={feature ? <FeaturePiece product={feature} compact /> : null}
      />
      <div className="wrap">
        {list.data.length === 0 ? (
          <EmptyNotice text={common('nothingYet')} />
        ) : (
          <div className="project-rows">
            {list.data.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                meta={[
                  ...(project.location ? [project.location] : []),
                  ...(project.year ? [String(project.year)] : []),
                ]}
                priority={index === 0}
              />
            ))}
          </div>
        )}
        <Pagination meta={list.meta} hrefFor={(next) => projectsHref(next)} label={t('pagination')} />
      </div>
      <ClientsRail clients={clients} />
    </main>
  );
}
