'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { MorphImage } from '@/components/media/MorphImage';
import { Link } from '@/i18n/navigation';
import type { Scene } from '@/lib/api/types';
import { coverPoint, placeHotspot } from '@/lib/scenes/hotspot';
import { morphName, morphTypes, pendingMorphFor } from '@/lib/ui/morph';

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7, aprovado pela Franccino e pelo marketing em 26/10/2026):
 * a foto do ambiente e um ponto em cada peça. O ponto abre um cartão só com a foto e o nome da peça, que leva à página
 * dela (sem botões a mais, como na esteira). Com o mouse, o cartão abre ao passar pelo ponto. Teclado: Tab passa pelos pontos na ordem do painel, Enter abre, Esc
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
/**
 * O ponto guardado ao abrir a peça a partir desta página (e só dela). Só lê: o React pode renderizar a página de volta
 * mais de uma vez antes de mostrá-la, e o ponto sai do armazenamento depois que ela aparece.
 */
function savedPoint(key: string, total: number): number | null {
  try {
    const saved = window.sessionStorage.getItem(key);
    const [path, value] = saved?.split('|') ?? [];
    if (path !== window.location.pathname || value === undefined) return null;
    const index = Number(value);
    return index >= 0 && index < total ? index : null;
  } catch {
    return null;
  }
}

export function ScenePoints({ scene, frameRatio }: { scene: Scene; frameRatio?: number }) {
  const t = useTranslations('home.scenes');
  const pathname = usePathname();
  // Volta da página da peça aberta pelo ponto: o cartão daquele ponto já nasce aberto, no mesmo quadro em que a página
  // volta, e a foto encolhe até ele (retorno de 12 e 13/11/2026). Só numa navegação do site, nunca na hidratação.
  const storageKey = `franccino:scene:${scene.id}`;
  const [open, setOpen] = useState<number | null>(() =>
    pendingMorphFor(pathname) ? savedPoint(storageKey, scene.hotspots.length) : null,
  );
  useEffect(() => {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Sem armazenamento: nada guardado.
    }
  }, [storageKey]);
  const rootRef = useRef<HTMLUListElement | null>(null);
  // Com o mouse, o cartão abre ao passar pelo ponto (retorno de 13/11/2026: não precisa acertar o clique). Sair do
  // ponto fecha depois de um instante, para dar tempo de levar o cursor até o cartão.
  const closeTimer = useRef<number | null>(null);
  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const hoverOpen = (event: React.PointerEvent, index: number) => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    cancelClose();
    setOpen(index);
  };
  const hoverClose = (event: React.PointerEvent, index: number) => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen((current) => (current === index ? null : current));
    }, 250);
  };
  useEffect(() => cancelClose, []);
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
            onPointerEnter={(event) => hoverOpen(event, index)}
            onPointerLeave={(event) => hoverClose(event, index)}
          >
            <button
              type="button"
              className="scene__dot"
              aria-expanded={isOpen}
              aria-controls={cardId}
              aria-label={t('point', { name: hotspot.product.name })}
              onClick={(event) => {
                // Com o mouse o cartão já abriu ao passar: o clique não pode fechá-lo. Toque e teclado alternam.
                const pointerType = (event.nativeEvent as PointerEvent).pointerType;
                setOpen(pointerType === 'mouse' ? index : isOpen ? null : index);
              }}
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
