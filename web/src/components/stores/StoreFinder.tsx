'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import type { Store } from '@/lib/api/types';
import { telHref } from '@/lib/contact-links';

function StoreCard({ store }: { store: Store }) {
  const t = useTranslations('stores');
  const type = t.has(`types.${store.type}`) ? t(`types.${store.type}`) : store.type;
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
    </article>
  );
}

/** Lojas por estado (UF), com botões de filtro (estado local, sem navegar). */
export function StoreFinder({
  stores,
  states,
  children,
}: {
  stores: Store[];
  states: string[];
  children?: ReactNode;
}) {
  const t = useTranslations('stores');
  const [state, setState] = useState<string | null>(states[0] ?? null);
  const visible = stores.filter((store) => store.state === state);
  return (
    <div className="stores">
      <div className="stores__intro">
        {children}
        <div className="chips" role="group" aria-label={t('stateFilter')}>
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
      </div>
      <div className="store-list" aria-live="polite">
        {visible.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
