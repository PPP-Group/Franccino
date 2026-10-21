'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { requestModelLink } from '@/lib/api/forms';

type Status = 'loading' | 'ready' | 'error';

/**
 * Só é montado quando o visitante pede o 3D: o pacote é importado sob demanda (spec §6, "3D") e o GLB, que fica em
 * disco privado, vem de um link temporário pedido na hora (contrato 13.2). "Tentar de novo" remonta o elemento
 * (`key`), refaz o import e pede um link novo, cobrindo falha do pacote, do link e do arquivo.
 */
export function ModelViewer({ slug, alt }: { slug: string; alt: string }) {
  const t = useTranslations('product.stage');
  const locale = useLocale();
  const ref = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    requestModelLink(slug, locale)
      .then(({ url }) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [slug, locale, attempt]);

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
  }, [attempt, src]);

  function retry() {
    setStatus('loading');
    setSrc(null);
    setAttempt((value) => value + 1);
  }

  return (
    <>
      {src ? (
        <model-viewer
          key={attempt}
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
      ) : null}
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
