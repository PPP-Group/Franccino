import { VideoFacade } from '@/components/media/VideoFacade';
import type { PageVideo as PageVideoData } from '@/lib/api/types';

/**
 * Vídeo de um projeto ou de uma coleção (o filme do Clara Arte, o manifesto da TEMPO): o MP4 do próprio site, que só
 * começa a baixar no clique. O quadro segue a capa: um filme em pé (9:16) fica em pé e mais estreito.
 */
export function PageVideo({ video, title, id }: { video: PageVideoData; title: string; id: string }) {
  const { poster } = video;
  const ratio = poster?.width && poster.height ? poster.width / poster.height : 16 / 9;
  return (
    <section
      aria-labelledby={id}
      className={ratio < 1 ? 'page-video page-video--portrait' : 'page-video'}
      data-reveal
    >
      <h2 id={id} className="visually-hidden">
        {title}
      </h2>
      <div className="block-video" style={{ ['--video-ratio' as string]: String(ratio) }}>
        <VideoFacade title={title} src={video.url} poster={poster?.src ?? null} />
      </div>
    </section>
  );
}
