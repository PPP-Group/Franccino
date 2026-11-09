'use client';

import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { MorphImage } from '@/components/media/MorphImage';
import { STAGE_SIZES } from '@/lib/product/gallery';
import { Icon } from '@/components/ui/Icon';
import type { Image, ProductDetail } from '@/lib/api/types';
import { ModelViewer } from './ModelViewer';
import { productMorphName } from './ProductPlate';

type Mode = 'photo' | '3d';

const subscribeNoop = () => () => {};
const wants3dFromUrl = () => new URLSearchParams(window.location.search).get('view') === '3d';

/** Largura real do palco (`.product`, 7 de 12 colunas; uma coluna abaixo de 61,25rem; até ~810 px no `--max`). */
/** Miniaturas: 5 por linha ao lado do painel, 4 no celular. */
const THUMB_SIZES = '(max-width: 35rem) 24vw, (max-width: 61.25rem) 18vw, 160px';

/**
 * Maior largura que a foto tem de verdade (a maior conversão, ou o original). O palco não amplia além dela: as fotos
 * de origem são pequenas e comprimidas, e ampliadas ficavam mais borradas do que precisavam.
 */
function naturalWidth(image: Image): number | null {
  const widths = image.srcset.map((entry) => entry.width);
  const largest = widths.length > 0 ? Math.max(...widths) : null;
  if (image.width && largest) {
    return Math.min(image.width, largest);
  }
  return image.width ?? largest;
}

type ProductStageProps = {
  images: Image[];
  name: string;
  slug: string;
  model: ProductDetail['model_3d'];
};

/**
 * Galeria com alternância Fotos/3D. `?view=3d` é lido no cliente (useSyncExternalStore)
 * para a página de produto continuar estática.
 */
export function ProductStage({ images, name, slug, model }: ProductStageProps) {
  const t = useTranslations('product.stage');
  const wants3d = useSyncExternalStore(subscribeNoop, wants3dFromUrl, () => false);
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [index, setIndex] = useState(0);
  const mode: Mode = chosen ?? (model && wants3d ? '3d' : 'photo');
  const current = images[index] ?? images[0] ?? null;
  const natural = current ? naturalWidth(current) : null;
  const stageStyle = natural ? ({ '--stage-img-max': `${natural}px` } as CSSProperties) : undefined;

  return (
    <div className="gallery">
      <div className={mode === '3d' ? 'gallery__stage is-3d' : 'gallery__stage'} style={stageStyle}>
        {current ? (
          // A foto do palco é sempre a da transição (ideia 10): chega como a foto do card clicado e, na volta, encolhe
          // até o card com a foto que estiver à vista, mesmo que a pessoa tenha trocado de foto (retorno de 09/11/2026).
          <MorphImage
            name={productMorphName(slug)}
            image={current}
            sizes={STAGE_SIZES}
            priority
            fit="contain"
            hero
          />
        ) : null}
        {model && mode === '3d' ? (
          <div className="stage-3d">
            <ModelViewer slug={slug} alt={t('modelAlt', { name })} />
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
              <ApiImage image={item} sizes={THUMB_SIZES} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
