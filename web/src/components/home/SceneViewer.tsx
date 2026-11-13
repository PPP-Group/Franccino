'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { MorphImage } from '@/components/media/MorphImage';
import { Link } from '@/i18n/navigation';
import type { Scene } from '@/lib/api/types';
import { coverPoint, placeHotspot } from '@/lib/scenes/hotspot';
import { morphName, morphTypes } from '@/lib/ui/morph';

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7, aprovado pela Franccino e pelo marketing em 26/10/2026):
 * a foto do ambiente e um ponto em cada peça. O ponto abre um cartão só com a foto e o nome da peça, que leva à página
 * dela (sem botões a mais, como na esteira). Teclado: Tab passa pelos pontos na ordem do painel, Enter abre, Esc
 * fecha; o clique fora também fecha.
 */
export function SceneViewer({ scene, priority = false }: { scene: Scene; priority?: boolean }) {
  return (
    <div className="scene">
      <ApiImage image={scene.image} sizes="(max-width: 97.5rem) 94vw, 1448px" priority={priority} />
      <ScenePoints scene={scene} />
    </div>
  );
}

/**
 * Só a camada de pontos, por cima de uma foto que já está na página (a faixa do Corporativo, retorno de 07/11/2026).
 * `frameRatio` (largura / altura do quadro): a foto aparece recortada com `object-fit: cover` nessa proporção, e os
 * pontos acompanham o recorte (os que caem fora do quadro somem).
 */
export function ScenePoints({ scene, frameRatio }: { scene: Scene; frameRatio?: number }) {
  const t = useTranslations('home.scenes');
  const [open, setOpen] = useState<number | null>(null);
  const rootRef = useRef<HTMLUListElement | null>(null);
  // Volta da página da peça aberta pelo ponto: o cartão daquele ponto já está aberto, e a foto encolhe até ele
  // (retorno de 12/11/2026: na volta a foto não tinha para onde ir).
  const storageKey = `franccino:scene:${scene.id}`;
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(storageKey);
      window.sessionStorage.removeItem(storageKey);
    } catch {
      return;
    }
    // Só na página de onde a peça foi aberta (o mesmo ambiente aparece na home e no projeto).
    const [path, value] = saved?.split('|') ?? [];
    const index = path === window.location.pathname && value !== undefined ? Number(value) : -1;
    if (index >= 0 && index < scene.hotspots.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com a navegação de volta
      setOpen(index);
    }
  }, [storageKey, scene.hotspots.length]);
  const imageRatio = scene.image.width && scene.image.height ? scene.image.width / scene.image.height : 0;

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
    <ul ref={rootRef} className="scene__points" aria-label={t('points', { title: scene.title })}>
      {scene.hotspots.map((hotspot, index) => {
        const point = frameRatio
          ? coverPoint(hotspot.x, hotspot.y, imageRatio, frameRatio)
          : { x: hotspot.x, y: hotspot.y };
        if (!point) {
          return null;
        }
        const place = placeHotspot(point.x, point.y);
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
                onClick={() => {
                  try {
                    window.sessionStorage.setItem(storageKey, `${window.location.pathname}|${index}`);
                  } catch {
                    // Sem armazenamento, a volta mostra a foto sem o cartão aberto.
                  }
                }}
                className="scene__card-link"
                href={{ pathname: '/products/[slug]', params: { slug: hotspot.product.slug } }}
                transitionTypes={
                  hotspot.product.cover
                    ? morphTypes(morphName('piece', `scene-${scene.id}-${hotspot.product.slug}`))
                    : undefined
                }
                data-morph-link={
                  hotspot.product.cover
                    ? morphName('piece', `scene-${scene.id}-${hotspot.product.slug}`)
                    : undefined
                }
              >
                {hotspot.product.cover ? (
                  <span className="scene__card-media hover-zoom">
                    <MorphImage
                      name={morphName('piece', `scene-${scene.id}-${hotspot.product.slug}`)}
                      image={hotspot.product.cover}
                      sizes="160px"
                      fit="contain"
                    />
                  </span>
                ) : null}
                <span className="scene__card-name">{hotspot.product.name}</span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
