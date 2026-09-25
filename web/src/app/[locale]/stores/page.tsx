import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getStores, type StoreList } from '@/lib/api/content';
import { isValidationError } from '@/lib/api/errors';
import { firstValue, type RawSearchParams } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

const EMPTY_STORE_LIST: StoreList = { stores: [], states: [] };

type StoresPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: StoresPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.stores' });

  return buildMetadata({ locale: locale as Locale, href: '/stores', title: t('title') });
}

export default async function StoresPage({ params, searchParams }: StoresPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.stores');
  const tStores = await getTranslations('stores');
  const state = firstValue((await searchParams).state);

  let storeList: StoreList;
  try {
    storeList = await getStores(locale as Locale, { state });
  } catch (error) {
    if (!isValidationError(error)) {
      throw error;
    }
    storeList = EMPTY_STORE_LIST;
  }
  const { stores, states } = storeList;

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>

      {states.length > 0 && (
        <nav aria-label={tStores('stateFilter')}>
          <ul>
            <li>
              <Link href="/stores">{tStores('allStates')}</Link>
            </li>
            {states.map((uf) => (
              <li key={uf}>
                <Link href={{ pathname: '/stores', query: { state: uf } }}>{uf}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {stores.length === 0 ? (
        <p>{tStores('empty')}</p>
      ) : (
        <ul>
          {stores.map((store) => {
            const cityState = [store.city, store.state].filter(Boolean).join(', ');
            return (
              <li key={store.id}>
                <address>
                  <p>{store.name}</p>
                  <p>{store.address}</p>
                  <p>{cityState}</p>
                  {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
                  {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
                  {store.website_url && <a href={store.website_url}>{store.website_url}</a>}
                </address>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
