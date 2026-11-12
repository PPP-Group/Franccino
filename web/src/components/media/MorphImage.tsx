'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, ViewTransition, type CSSProperties } from 'react';
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
  /**
   * Caixa em volta da foto que anda no movimento, maior que ela (a peça sem fundo do carrossel dentro do tamanho que a
   * capa teria): o quadro já sai do carrossel no tamanho da foto da página da peça (retorno de 12/11/2026).
   */
  box?: { className: string; style: CSSProperties };
};

type Start = { name: string; src: string | null; fit: MorphFit };

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
  box,
}: MorphImageProps) {
  const pathname = usePathname();
  const [start] = useState<Start>(() => {
    const pending = pendingMorphFor(pathname);
    if (!pending || (!hero && pending.name !== name)) {
      return { name, src: null, fit };
    }
    return {
      name: hero ? pending.name : name,
      // A peça sem fundo (carrossel) não serve de foto provisória na página da peça: ela ocupa o quadro inteiro e a foto
      // da página tem margem branca; a troca no fim era o "tranco" (retorno de 09/11/2026). Ali a foto é a própria.
      src: pickLoadedSource(image, isImageLoaded) ?? (hero && pending.fit !== 'cutout' ? pending.src : null),
      // A foto de destino adota o encaixe que a origem pediu (a peça sem fundo do carrossel).
      fit: hero ? (pending.fit ?? fit) : fit,
    };
  });
  const [src, setSrc] = useState(start.src);
  // Foto grande aberta sem movimento de foto (menu, link de texto, endereço digitado): sobe e encaixa de leve
  // (retorno de 09/11/2026: "não abrir de uma vez"). Com movimento, quem anima é a transição.
  const [arriving] = useState(() => hero && pendingMorphFor(pathname) === null);

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

  // A versão provisória vale só para a foto com que a página abriu: trocada a foto (galeria), entra a nova inteira.
  const [startImageId] = useState(image.id);
  const shown = src && image.id === startImageId ? { ...image, src, srcset: [] } : image;
  const picture = (
    <ApiImage
      image={shown}
      sizes={sizes}
      priority={priority || src !== null}
      className={arriving ? [className, 'is-arriving'].filter(Boolean).join(' ') : className}
      // A foto que entrou no movimento já está na tela: a troca pela versão do tamanho certo não refaz o fade.
      fade={start.src === null}
    />
  );
  return (
    <ViewTransition name={start.name} share={morphShare(start.fit, start.name)} default="none">
      {box ? (
        <span className={box.className} style={box.style}>
          {picture}
        </span>
      ) : (
        picture
      )}
    </ViewTransition>
  );
}
