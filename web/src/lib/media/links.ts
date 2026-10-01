import type { MediaLink } from '@/lib/api/types';

export type PlayableVideo = MediaLink & { embed_url: string };

/**
 * Splits the panel's "videos and links" into players (YouTube/Vimeo, with `embed_url`) and plain external
 * links. A video from any other host has no `embed_url` and is listed as a link, keeping the panel order.
 */
export function splitMediaLinks(items: MediaLink[]): { videos: PlayableVideo[]; links: MediaLink[] } {
  const videos: PlayableVideo[] = [];
  const links: MediaLink[] = [];
  for (const item of items) {
    if (item.kind === 'video' && item.embed_url) {
      videos.push({ ...item, embed_url: item.embed_url });
    } else {
      links.push(item);
    }
  }
  return { videos, links };
}

/** The player only loads after the visitor's click, so it may start right away. */
export function withAutoplay(embedUrl: string): string {
  const url = new URL(embedUrl);
  url.searchParams.set('autoplay', '1');
  return url.toString();
}
