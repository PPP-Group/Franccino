'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type Status = 'loading' | 'ready' | 'error';

/** Só é montado quando o visitante pede o 3D: o pacote é importado sob demanda (spec §6, "3D"). */
export function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const t = useTranslations('product.stage');
  const ref = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let active = true;
    const element = ref.current;
    const onLoad = () => {
      if (active) setStatus('ready');
    };
    const onError = () => {
      if (active) setStatus('error');
    };
    element?.addEventListener('load', onLoad);
    element?.addEventListener('error', onError);
    import('@google/model-viewer').catch(onError);
    return () => {
      active = false;
      element?.removeEventListener('load', onLoad);
      element?.removeEventListener('error', onError);
    };
  }, []);

  return (
    <>
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        touch-action="pan-y"
        shadow-intensity="0.8"
        loading="eager"
        reveal="auto"
      />
      {status !== 'ready' ? (
        <p className="stage-3d__status meta" role="status">
          {status === 'error' ? t('modelError') : t('modelLoading')}
        </p>
      ) : null}
    </>
  );
}
