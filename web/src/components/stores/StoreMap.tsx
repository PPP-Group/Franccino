'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { Store } from '@/lib/api/types';
import { mapView, project, type MapPoint } from '@/lib/stores/map-view';

type Located = Store & MapPoint;

function isLocated(store: Store): store is Located {
  return store.latitude !== null && store.longitude !== null;
}

/**
 * Mapa com os pinos das lojas, no espaço abaixo dos filtros (ajustes do cliente, 06/10/2026, "como no
 * site antigo"). Segue o filtro de estado e tipo; o pino leva ao cartão da loja na lista.
 */
export function StoreMap({ stores }: { stores: Store[] }) {
  const t = useTranslations('stores');
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const located = stores.filter(isLocated);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(frame);
    return () => {
      observer.disconnect();
    };
  }, []);

  const view = mapView(located, size.width, size.height);
  return (
    <figure className="store-map" aria-label={t('mapLabel')}>
      <div ref={frameRef} className="store-map__frame">
        {view ? (
          <>
            <div className="store-map__tiles" aria-hidden="true">
              {view.tiles.map((tile) => (
                // eslint-disable-next-line @next/next/no-img-element -- ladrilho de mapa externo, sem otimização.
                <img
                  key={tile.key}
                  src={tile.src}
                  alt=""
                  width={256}
                  height={256}
                  loading="lazy"
                  decoding="async"
                  style={{ left: tile.left, top: tile.top }}
                />
              ))}
            </div>
            <ul className="store-map__pins">
              {located.map((store) => {
                const { x, y } = project(store, view.zoom);
                return (
                  <li key={store.id} style={{ left: x - view.originX, top: y - view.originY }}>
                    <a className="store-map__pin" href={`#store-${store.id}`} title={store.name}>
                      <span className="visually-hidden">{store.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>
      <figcaption className="store-map__credit">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          {t('mapAttribution')}
        </a>
      </figcaption>
    </figure>
  );
}
