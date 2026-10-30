import { useTranslations } from 'next-intl';
import type { Scene } from '@/lib/api/types';
import { SceneViewer } from './SceneViewer';

/** Ambientes da home: um abaixo do outro, cada um com o nome como título (some sem ambiente publicado). */
export function ScenesSection({ scenes }: { scenes: Scene[] }) {
  const t = useTranslations('home.scenes');
  return (
    <section className="section scenes" aria-labelledby="scenes-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="scenes-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
        </div>
        <div className="scenes__list">
          {scenes.map((scene) => (
            <figure key={scene.id} className="scenes__item">
              <SceneViewer scene={scene} />
              <figcaption className="meta">{scene.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
