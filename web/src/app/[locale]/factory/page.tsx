import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageBanner } from '@/components/layout/PageBanner';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'factory' }),
    getPage(locale as Locale, 'factory'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/factory' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function FactoryPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page] = await Promise.all([
    getTranslations({ locale, namespace: 'factory' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'factory'),
  ]);
  const blocks = page?.content ?? [];
  // A seção do fim continua a alternância de fundos dos blocos (branco, areia, branco…).
  const nextOnSand = blocks.length % 2 === 1;
  const next = [
    { href: '/stores', label: t('nextStores') },
    { href: '/projects', label: t('nextProjects') },
    { href: '/collections', label: t('nextCollections') },
  ] as const;
  return (
    <main className="factory-page">
      {/* Abre com a foto da fachada (capa da página no painel), como pedido nos ajustes de 06/10/2026. */}
      <PageBanner image={page?.cover ?? null} title={page?.title ?? t('title')} lead={page?.intro} />
      {blocks.length > 0 ? (
        <Blocks blocks={blocks} editorial />
      ) : (
        <div className="wrap page-end">
          <EmptyNotice text={common('nothingYet')} />
        </div>
      )}
      {/* Continuidade (rodada 3): o fim da página leva a lojas, projetos e coleções, sem voltar à home. */}
      <section
        className={nextOnSand ? 'factory-next factory-next--sand' : 'factory-next'}
        aria-labelledby="factory-next-title"
      >
        <div className="wrap" data-reveal>
          <h2 id="factory-next-title">{t('nextTitle')}</h2>
          <ul className="factory-next__links" data-reveal="stagger">
            {next.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="factory-next__link">
                  <span>{item.label}</span>
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <RecentlyViewed />
    </main>
  );
}
