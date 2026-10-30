'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { Scene } from '@/lib/api/types';
import { placeHotspot } from '@/lib/scenes/hotspot';

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7, aprovado pela Franccino e pelo marketing em 26/10/2026):
 * a foto do ambiente e um ponto em cada peça. O ponto abre um cartão só com a foto e o nome da peça, que leva à página
 * dela (sem botões a mais, como na esteira). Teclado: Tab passa pelos pontos na ordem do painel, Enter abre, Esc
 * fecha; o clique fora também fecha.
 */
export function SceneViewer({ scene, priority = false }: { scene: Scene; priority?: boolean }) {
  const t = useTranslations('home.scenes');
  const [open, setOpen] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open === null) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="scene">
      <ApiImage image={scene.image} sizes="(max-width: 73.75rem) 100vw, 1440px" priority={priority} />
      <ul className="scene__points" aria-label={t('points', { title: scene.title })}>
        {scene.hotspots.map((hotspot, index) => {
          const place = placeHotspot(hotspot.x, hotspot.y);
          const isOpen = open === index;
          const cardId = `scene-${scene.id}-point-${index}`;
          return (
            <li
              key={`${hotspot.product.id}-${index}`}
              className={isOpen ? 'scene__point is-open' : 'scene__point'}
              style={{ left: place.left, top: place.top }}
              data-horizontal={place.horizontal}
              data-vertical={place.vertical}
            >
              <button
                type="button"
                className="scene__dot"
                aria-expanded={isOpen}
                aria-controls={cardId}
                aria-label={t('point', { name: hotspot.product.name })}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span aria-hidden="true" className="scene__dot-core" />
              </button>
              <div id={cardId} className="scene__card" hidden={!isOpen}>
                <Link
                  className="scene__card-link"
                  href={{ pathname: '/products/[slug]', params: { slug: hotspot.product.slug } }}
                >
                  {hotspot.product.cover ? (
                    <span className="scene__card-media">
                      <ApiImage image={hotspot.product.cover} sizes="160px" />
                    </span>
                  ) : null}
                  <span className="scene__card-name">{hotspot.product.name}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
