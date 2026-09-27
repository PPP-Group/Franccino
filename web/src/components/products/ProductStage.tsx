'use client';

import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import type { Image, ProductDetail } from '@/lib/api/types';
import { ModelViewer } from './ModelViewer';

type Mode = 'photo' | '3d';

const subscribeNoop = () => () => {};
const wants3dFromUrl = () => new URLSearchParams(window.location.search).get('view') === '3d';

type ProductStageProps = { images: Image[]; name: string; model: ProductDetail['model_3d'] };

/**
 * Galeria com alternância Fotos/3D. `?view=3d` é lido no cliente (useSyncExternalStore)
 * para a página de produto continuar estática.
 */
export function ProductStage({ images, name, model }: ProductStageProps) {
  const t = useTranslations('product.stage');
  const wants3d = useSyncExternalStore(subscribeNoop, wants3dFromUrl, () => false);
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [index, setIndex] = useState(0);
  const mode: Mode = chosen ?? (model && wants3d ? '3d' : 'photo');
  const current = images[index] ?? images[0] ?? null;

  return (
    <div className="gallery">
      <div className={mode === '3d' ? 'gallery__stage is-3d' : 'gallery__stage'}>
        {current ? (
          <ApiImage image={current} sizes="(max-width: 61.25rem) 100vw, 58vw" priority={index === 0} />
        ) : null}
        {model && mode === '3d' ? (
          <div className="stage-3d">
            <ModelViewer src={model.url} alt={t('modelAlt', { name })} />
          </div>
        ) : null}
        {model ? (
          <div className="stage-toggle" role="group" aria-label={t('viewLabel')}>
            <button type="button" aria-pressed={mode === 'photo'} onClick={() => setChosen('photo')}>
              <Icon name="photo" />
              <span>{t('photos')}</span>
            </button>
            <button type="button" aria-pressed={mode === '3d'} onClick={() => setChosen('3d')}>
              <Icon name="cube" />
              <span>{t('model')}</span>
            </button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="thumbs" role="group" aria-label={t('thumbsLabel')}>
          {images.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={i === index}
              aria-label={t('showImage', { index: i + 1, total: images.length })}
              onClick={() => {
                setIndex(i);
                setChosen('photo');
              }}
            >
              <ApiImage image={item} sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
