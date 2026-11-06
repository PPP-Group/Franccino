'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, ViewTransition } from 'react';
import type { Image } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';
import { isImageLoaded, morphShare, pendingMorphFor, pickLoadedSource, type MorphFit } from '@/lib/ui/morph';
import { ApiImage } from './ApiImage';

type MorphImageProps = {
  /** Nome do par (`morphName`). Na foto de destino (`hero`), o nome inicial; ela adota o da origem clicada. */
  name: string;
  image: Image;
  sizes: string;
  /** `contain`: peça inteira em fundo branco (cards e palco da peça); `cover`: foto recortada (capas, banners). */
  fit?: MorphFit;
  /** Foto grande da página de destino (palco da peça, banner): recebe o nome da origem que a abriu. */
  hero?: boolean;
  priority?: boolean;
  className?: string;
  parallax?: boolean;
};

type Start = { name: string; src: string | null };

/** Espera o movimento terminar (as animações `::view-transition`), com um limite. */
function afterViewTransition(callback: () => void): () => void {
  let done = false;
  const finish = () => {
    if (!done) {
      done = true;
      callback();
    }
  };
  const timer = window.setTimeout(finish, 2500);
  const frame = window.requestAnimationFrame(() => {
    const running = document.getAnimations().filter((animation) => {
      const effect = animation.effect as KeyframeEffect | null;
      return effect?.pseudoElement?.startsWith('::view-transition') ?? false;
    });
    void Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(finish);
  });
  return () => {
    done = true;
    window.clearTimeout(timer);
    window.cancelAnimationFrame(frame);
  };
}

/**
 * Foto que faz parte do movimento "abrir a peça / voltar dela" (ideia 10, `lib/ui/morph.ts`). Fora dessa navegação
 * é só um `ApiImage`. Quando monta no meio dela, a primeira pintura usa uma versão da foto já baixada nesta visita (ou
 * a foto da origem clicada), para o movimento terminar sobre a foto pronta, sem quadro em branco; a versão do tamanho
 * certo entra quando o movimento acaba (o navegador troca sem piscar).
 */
export function MorphImage({
  name,
  image,
  sizes,
  fit = 'cover',
  hero = false,
  priority = false,
  className,
  parallax = false,
}: MorphImageProps) {
  const pathname = usePathname();
  const [start] = useState<Start>(() => {
    const pending = pendingMorphFor(pathname);
    if (!pending || (!hero && pending.name !== name)) {
      return { name, src: null };
    }
    return {
      name: hero ? pending.name : name,
      src: pickLoadedSource(image, isImageLoaded) ?? (hero ? pending.src : null),
    };
  });
  const [src, setSrc] = useState(start.src);

  // Depois do movimento, a versão do tamanho certo é baixada e decodificada antes de entrar: a troca não pisca.
  useEffect(() => {
    if (!src) return undefined;
    let cancelled = false;
    const stop = afterViewTransition(() => {
      const next = new window.Image();
      next.sizes = sizes;
      next.srcset = buildSrcSet(image);
      next.src = image.src;
      const swap = () => {
        if (!cancelled) setSrc(null);
      };
      next.decode().then(swap, swap);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [src, image, sizes]);

  const shown = src ? { ...image, src, srcset: [] } : image;
  return (
    <ViewTransition name={start.name} share={morphShare(fit, start.name)} default="none">
      <ApiImage
        image={shown}
        sizes={sizes}
        priority={priority || src !== null}
        className={className}
        parallax={parallax}
      />
    </ViewTransition>
  );
}
