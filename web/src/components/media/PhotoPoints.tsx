'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ScenePoints } from '@/components/home/SceneViewer';
import type { Image, ImagePoints } from '@/lib/api/types';
import { asScene } from '@/lib/scenes/image-points';

/**
 * Pontos clicáveis por cima de uma foto do site (banner, capa, galeria; retorno de 13/11/2026). Vai dentro da caixa
 * posicionada da foto e ocupa a caixa inteira. `fit="cover"`: a foto aparece recortada (`object-fit: cover`, no meio),
 * e os pontos acompanham o recorte, medido na tela (o banner muda de proporção com a janela). `fit="fill"`: a caixa
 * tem a proporção da foto, sem recorte.
 */
export function PhotoPoints({
  points,
  image,
  fit = 'cover',
  className,
}: {
  points: ImagePoints | null | undefined;
  image: Image;
  fit?: 'cover' | 'fill';
  /** Ex.: `photo-points--wide`, que some no celular quando lá aparece outra foto. */
  className?: string;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element || fit !== 'cover') {
      return;
    }
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setRatio(width > 0 && height > 0 ? width / height : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit]);

  if (!points || points.hotspots.length === 0) {
    return null;
  }
  return (
    <div ref={box} className={className ? `photo-points ${className}` : 'photo-points'}>
      {/*
        Os pontos montam já na primeira pintura (a medida do recorte chega no mesmo quadro, pelo efeito de layout): na
        volta da peça aberta por um ponto, o cartão dele precisa existir no commit da volta para a foto encolher até ele
        (retorno de 13/11/2026).
      */}
      <ScenePoints
        scene={asScene(points, image)}
        frameRatio={fit === 'cover' ? (ratio ?? undefined) : undefined}
      />
    </div>
  );
}
