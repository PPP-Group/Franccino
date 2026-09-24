'use client';

/**
 * "View in 3D" toggle. `@google/model-viewer` (a custom element that
 * registers itself as a side effect on import) is dynamically imported only
 * when the visitor clicks the button, so it never loads for products
 * without a `model_3d`, or before anyone asks for it.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type ModelViewerProps = {
  model3d: { url: string; size: number | null } | null;
  alt: string;
};

export function ModelViewer({ model3d, alt }: ModelViewerProps) {
  const t = useTranslations('products');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle');

  if (!model3d) {
    return null;
  }

  async function handleClick() {
    setStatus('loading');
    await import('@google/model-viewer');
    setStatus('ready');
  }

  if (status === 'ready') {
    return (
      <model-viewer
        src={model3d.url}
        alt={alt}
        ar
        camera-controls
        auto-rotate
        loading="eager"
        reveal="auto"
      />
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={status === 'loading'}>
      {status === 'loading' ? t('model3dLoading') : t('model3d')}
    </button>
  );
}
