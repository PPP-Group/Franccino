'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore, ViewTransition, type CSSProperties } from 'react';
import type { Image } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';
import { setHeroName } from '@/components/layout/navigation-motion';
import {
  getActiveMorph,
  isImageLoaded,
  morphShare,
  pendingMorphFor,
  pickLoadedSource,
  subscribeActiveMorph,
  type MorphFit,
} from '@/lib/ui/morph';
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
  /** O card da peça que entra em primeiro na lista (`LeadPlate`): só ele fica com o nome do par. */
  lead?: boolean;
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
  lead = false,
}: MorphImageProps) {
  const pathname = usePathname();
  const [start] = useState<Start>(() => {
    const pending = pendingMorphFor(pathname);
    if (!pending) {
      return { name, src: null, fit };
    }
    // A foto do topo adota o nome guardado para esta entrada (a origem que abriu a página); as outras ficam com o seu.
    const adopted = hero ? pending.hero : null;
    // A peça que entra em primeiro na lista: o card dela no lugar de sempre (escondido) cede o nome ao primeiro lugar.
    if (!hero && !lead && pending.lead?.morph === name) {
      return { name: `${name}--lead-origin`, src: null, fit };
    }
    const own = adopted?.name ?? name;
    const ownFit = adopted?.fit ?? fit;
    if (pending.name !== own) {
      return { name: own, src: null, fit: ownFit };
    }
    return {
      name: own,
      // A peça sem fundo (carrossel) não serve de foto provisória na página da peça: ela ocupa o quadro inteiro e a foto
      // da página tem margem branca; a troca no fim era o "tranco" (retorno de 09/11/2026). Ali a foto é a própria.
      src:
        pickLoadedSource(image, isImageLoaded) ?? (adopted && pending.fit !== 'cutout' ? pending.src : null),
      fit: ownFit,
    };
  });
  const [src, setSrc] = useState(start.src);
  // O par da navegação em curso anima mesmo que o tipo da transição tenha se perdido no caminho (`morphShare`).
  // Só a foto do par re-renderiza quando a marca muda (o valor lido é "sou eu ou não").
  const active = useSyncExternalStore(
    subscribeActiveMorph,
    () => getActiveMorph() === start.name,
    () => false,
  );

  // A foto do topo diz o nome que usa: a navegação da peça para a lista que a contém anda com ele.
  useEffect(() => {
    if (!hero) return undefined;
    setHeroName(pathname, start.name);
    return () => setHeroName(pathname, null);
  }, [hero, pathname, start.name]);
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
    <ViewTransition name={start.name} share={morphShare(start.fit, start.name, active)} default="none">
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
