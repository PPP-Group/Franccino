import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CardRail } from '@/components/content/CardRail';
import { EditorialGallery } from '@/components/content/EditorialGallery';
import { firstWithCover, neighbours } from '@/components/content/layout';
import { distinctLead } from '@/components/content/lead';
import { RichText } from '@/components/content/RichText';
import { PageBanner } from '@/components/layout/PageBanner';
import { morphName } from '@/lib/ui/morph';
import { FeaturePiece } from '@/components/products/FeaturePiece';
import { SceneViewer } from '@/components/home/SceneViewer';
import { ProductRail } from '@/components/products/ProductRail';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import type { Locale } from '@/i18n/config';
import { getAllProjectSlugs, getHome, getProject, getProjects } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Quantos projetos a API devolve para a faixa "Outros projetos" (o próprio sai da lista). */
const OTHER_PROJECTS = 9;

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

/**
 * Página do projeto, editorial (rodada 3): capa na largura toda com o título (parada enquanto a página sobe), uma
 * linha de fatos (só o que foi cadastrado), a frase de abertura e o texto na medida de leitura, a galeria alternando
 * imagens largas e pares, as peças usadas e, para continuar, "Outros projetos" numa faixa areia.
 */
export default async function ProjectPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const project = await getProject(locale, slug);
  if (!project) {
    notFound();
  }
  const lead = distinctLead(project.summary, project.description);
  // Sem a frase de abertura, o texto ficaria sozinho à esquerda: a direita mostra uma peça do projeto ou, sem nenhuma,
  // um destaque da home (retorno do tech lead de 06/11/2026: nada de metade vazia).
  const needsFeature = !lead && Boolean(project.description);
  const [t, list, home] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getProjects(locale, { per_page: OTHER_PROJECTS + 1 }),
    needsFeature && !project.products.some((product) => product.cover)
      ? getHome(locale)
      : Promise.resolve(null),
  ]);
  const feature = needsFeature ? firstWithCover([project.products, home?.featured_products ?? []]) : null;
  const typeLabel = (value: string) => (t.has(`types.${value}`) ? t(`types.${value}`) : value);
  // Fatos só com o que foi cadastrado; sem nenhum além do tipo, a linha mostra só o tipo.
  const facts = [
    { key: 'type', value: typeLabel(project.type) },
    { key: 'client', value: project.client_name },
    { key: 'location', value: project.location },
    { key: 'year', value: project.year ? String(project.year) : null },
    { key: 'architect', value: project.architect },
  ].filter((fact): fact is { key: string; value: string } => Boolean(fact.value));
  const others = neighbours(list.data, (item) => item.id === project.id, OTHER_PROJECTS);
  return (
    <main className="page-end">
      <PageBanner
        image={project.cover}
        morph={morphName('project', project.slug)}
        title={project.title}
        trail={[{ label: t('title'), href: '/projects' }]}
      />
      <div className="wrap">
        <dl className="project-facts">
          {facts.map((fact) => (
            <div key={fact.key}>
              <dt className="label">{t(fact.key)}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        {lead || project.description ? (
          <div className={feature ? 'project-story project-story--feature' : 'project-story'} data-reveal>
            {lead ? <p className="project-story__lead">{lead}</p> : null}
            {project.description ? <RichText html={project.description} className="prose" /> : null}
            {feature ? <FeaturePiece product={feature} /> : null}
          </div>
        ) : null}
        {project.scene && project.scene.hotspots.length > 0 ? (
          <section aria-labelledby="project-scene" className="project-section" data-reveal>
            <div className="section-head">
              <div>
                <h2 id="project-scene">{t('sceneTitle')}</h2>
                <p className="lead">{t('sceneLead')}</p>
              </div>
            </div>
            <SceneViewer scene={project.scene} />
          </section>
        ) : null}
        <EditorialGallery images={project.gallery} label={t('gallery')} />
        {project.products.length > 0 ? (
          <section aria-labelledby="project-pieces" className="project-section" data-reveal>
            <div className="section-head">
              <h2 id="project-pieces">{t('piecesTitle')}</h2>
            </div>
            <ProductRail label={t('piecesTitle')} products={project.products} scope="project" />
          </section>
        ) : null}
      </div>
      {others.length > 0 ? (
        <section className="band band--sand" aria-labelledby="other-projects">
          <div className="wrap" data-reveal>
            <h2 id="other-projects" className="section-title">
              {t('othersTitle')}
            </h2>
            <CardRail
              label={t('othersTitle')}
              items={others.map((item) => ({
                id: item.id,
                morph: morphName('project', item.slug),
                href: projectHref(item.slug),
                title: item.title,
                image: item.cover,
                meta: [typeLabel(item.type), ...(item.location ? [item.location] : [])],
              }))}
            />
          </div>
        </section>
      ) : null}
      <RecentlyViewed excludeIds={project.products.map((product) => product.id)} />
    </main>
  );
}
