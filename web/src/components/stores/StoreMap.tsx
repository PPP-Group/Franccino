'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Store } from '@/lib/api/types';
import { mapView, project, type MapPoint } from '@/lib/stores/map-view';

type Located = Store & MapPoint;

function isLocated(store: Store): store is Located {
  return store.latitude !== null && store.longitude !== null;
}

type StoreMapProps = {
  stores: Store[];
  /** Loja escolhida (pino em destaque até escolher outra). */
  activeId?: number | null;
  /** Loja com o mouse em cima, na lista (o pino dela acende). */
  hoverId?: number | null;
  /** Clique no pino: a lista destaca a loja e rola até ela, se ela estiver fora da tela. */
  onSelect?: (id: number) => void;
};

/**
 * Mapa com os pinos das lojas, no espaço abaixo dos filtros (ajustes do cliente, 06/10/2026, "como no
 * site antigo"). Segue o filtro de estado e tipo; o pino leva ao cartão da loja na lista. Sem JavaScript, o pino é
 * um link para a âncora da loja.
 */
export function StoreMap({ stores, activeId = null, hoverId = null, onSelect }: StoreMapProps) {
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
                const state = [
                  store.id === activeId ? 'is-active' : '',
                  store.id === hoverId ? 'is-hover' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li
                    key={store.id}
                    className={state || undefined}
                    style={{ left: x - view.originX, top: y - view.originY }}
                  >
                    <a
                      className="store-map__pin"
                      href={`#store-${store.id}`}
                      title={store.name}
                      aria-current={store.id === activeId ? 'location' : undefined}
                      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                        if (!onSelect) {
                          return;
                        }
                        event.preventDefault();
                        onSelect(store.id);
                      }}
                    >
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
