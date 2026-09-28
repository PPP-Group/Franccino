'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { modelSourceForAttempt } from '@/lib/product/model-source';

type Status = 'loading' | 'ready' | 'error';

/**
 * Só é montado quando o visitante pede o 3D: o pacote é importado sob demanda (spec §6, "3D").
 * "Tentar de novo" remonta o elemento (`key`), refaz o import e baixa o GLB de novo
 * (`modelSourceForAttempt`), cobrindo falha do pacote e do arquivo.
 */
export function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const t = useTranslations('product.stage');
  const ref = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

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
  }, [attempt]);

  function retry() {
    setStatus('loading');
    setAttempt((value) => value + 1);
  }

  return (
    <>
      <model-viewer
        key={attempt}
        ref={ref}
        src={modelSourceForAttempt(src, attempt)}
        alt={alt}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        touch-action="pan-y"
        shadow-intensity="0.8"
        loading="eager"
        reveal="auto"
      />
      {status === 'loading' ? (
        <p className="stage-3d__status meta" role="status">
          {t('modelLoading')}
        </p>
      ) : null}
      {status === 'error' ? (
        <div className="stage-3d__status" role="alert">
          <p className="meta">{t('modelError')}</p>
          <button type="button" className="btn btn--ghost btn--compact" onClick={retry}>
            {t('modelRetry')}
          </button>
        </div>
      ) : null}
    </>
  );
}
