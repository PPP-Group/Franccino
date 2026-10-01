import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import type { MediaLink } from '@/lib/api/types';
import { splitMediaLinks } from '@/lib/media/links';
import { VideoFacade } from './VideoFacade';

/** "Videos and links" registered in the panel for a product, designer or launch. Hidden when empty. */
export function MediaLinks({
  items,
  headingId,
  className = 'block',
}: {
  items: MediaLink[];
  headingId: string;
  className?: string;
}) {
  const t = useTranslations('mediaLinks');
  const common = useTranslations('common');
  if (items.length === 0) {
    return null;
  }
  const { videos, links } = splitMediaLinks(items);
  const heading = links.length === 0 ? 'videos' : videos.length === 0 ? 'links' : 'title';
  return (
    <section className={`media-links ${className}`} aria-labelledby={headingId}>
      <div className="block__title">
        <h2 id={headingId}>{t(heading)}</h2>
      </div>
      {videos.length > 0 ? (
        <div className="media-links__videos">
          {videos.map((video) => (
            <VideoFacade key={video.id} title={video.title} embedUrl={video.embed_url} />
          ))}
        </div>
      ) : null}
      {links.length > 0 ? (
        <ul className="store__links">
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span>{link.title}</span>
                <Icon name="arrow" />
                <span className="visually-hidden">{common('opensInNewWindow')}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
