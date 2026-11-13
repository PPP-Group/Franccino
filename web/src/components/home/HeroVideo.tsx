'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

type NetworkInformation = { saveData?: boolean };

/**
 * Vídeo curto em loop por cima da foto do banner (banco de ideias, ideia 14, retorno de 26/10/2026): sem som, sem
 * controles e sem texto por cima. Só baixa e toca quando o banner está na tela e é o slide visível do carrossel (um
 * slide `hidden` nunca intersecta); pausa com a aba em segundo plano. Quem pediu menos movimento ou economia de dados
 * fica com a foto, que também é o que aparece até o primeiro quadro.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (!video || reducedMotion || connection?.saveData) {
      return;
    }
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden) {
        video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      video.pause();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <video
      ref={ref}
      className={playing ? 'hero__video is-playing' : 'hero__video'}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}
