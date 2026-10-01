'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Store } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';
import { filterStores, STORE_TYPES } from '@/lib/stores/filter';
import { mapSearchUrl } from '@/lib/stores/map-link';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const common = useTranslations('common');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden">{common('opensInNewWindow')}</span>
    </a>
  );
}

function StoreCard({ store, detailed }: { store: Store; detailed: boolean }) {
  const t = useTranslations('stores');
  const type = t.has(`types.${store.type}`) ? t(`types.${store.type}`) : store.type;
  const whatsapp = detailed ? whatsappUrl(store.whatsapp) : null;
  return (
    <article className="store">
      <h3>{store.name}</h3>
      <address>
        {store.address}
        {store.address_complement ? <span>{store.address_complement}</span> : null}
        {store.district ? <span>{store.district}</span> : null}
        <span>{t('cityState', { city: store.city, state: store.state })}</span>
      </address>
      <ul className="meta meta-inline">
        <li>{type}</li>
        {store.phone ? (
          <li>
            <a href={telHref(store.phone)}>{store.phone}</a>
          </li>
        ) : null}
      </ul>
      {detailed ? (
        <>
          {store.opening_hours ? <p className="store__hours">{store.opening_hours}</p> : null}
          <ul className="store__links">
            {whatsapp ? (
              <li>
                <ExternalLink href={whatsapp}>
                  <Icon name="chat" />
                  <span>{t('whatsapp')}</span>
                </ExternalLink>
              </li>
            ) : null}
            {store.email ? (
              <li>
                <a href={`mailto:${store.email}`}>{store.email}</a>
              </li>
            ) : null}
            {store.website_url ? (
              <li>
                <ExternalLink href={store.website_url}>
                  <span>{t('website')}</span>
                </ExternalLink>
              </li>
            ) : null}
            {store.instagram_url ? (
              <li>
                <ExternalLink href={store.instagram_url}>
                  <span>{t('instagram')}</span>
                </ExternalLink>
              </li>
            ) : null}
            <li>
              <ExternalLink href={mapSearchUrl(store)}>
                <Icon name="pin" />
                <span>{t('map')}</span>
              </ExternalLink>
            </li>
          </ul>
        </>
      ) : null}
    </article>
  );
}

type StoreFinderProps = {
  stores: Store[];
  states: string[];
  children?: ReactNode;
  /** Começa em "Todos os estados" (página de lojas); sem isso, no primeiro estado (home). */
  allStates?: boolean;
  typeFilter?: boolean;
  detailed?: boolean;
};

/** Lojas por estado (UF) e, na página de lojas, por tipo; filtro local, sem navegar. */
export function StoreFinder({
  stores,
  states,
  children,
  allStates = false,
  typeFilter = false,
  detailed = false,
}: StoreFinderProps) {
  const t = useTranslations('stores');
  const [state, setState] = useState<string | null>(allStates ? null : (states[0] ?? null));
  const [type, setType] = useState<string | null>(null);
  const types = typeFilter ? STORE_TYPES.filter((value) => stores.some((store) => store.type === value)) : [];
  const visible = filterStores(stores, { state, type });
  return (
    <div className="stores">
      <div className="stores__intro">
        {children}
        <div className="chips" role="group" aria-label={t('stateFilter')}>
          {allStates ? (
            <button
              type="button"
              className="chip"
              aria-pressed={state === null}
              onClick={() => setState(null)}
            >
              {t('allStates')}
            </button>
          ) : null}
          {states.map((uf) => (
            <button
              key={uf}
              type="button"
              className="chip"
              aria-pressed={uf === state}
              onClick={() => setState(uf)}
            >
              {uf}
            </button>
          ))}
        </div>
        {types.length > 1 ? (
          <div className="chips" role="group" aria-label={t('typeFilter')}>
            <button type="button" className="chip" aria-pressed={type === null} onClick={() => setType(null)}>
              {t('allTypes')}
            </button>
            {types.map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={type === value}
                onClick={() => setType(value)}
              >
                {t(`types.${value}`)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="store-list" aria-live="polite">
        {visible.length > 0 ? (
          visible.map((store) => <StoreCard key={store.id} store={store} detailed={detailed} />)
        ) : (
          <p className="lead">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
