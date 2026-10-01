import { describe, expect, it } from 'vitest';
import type { MediaLink } from '@/lib/api/types';
import { splitMediaLinks, withAutoplay } from './links';

const link = (overrides: Partial<MediaLink>): MediaLink => ({
  id: 1,
  kind: 'video',
  title: 'Making of',
  url: 'https://www.youtube.com/watch?v=abc123',
  embed_url: 'https://www.youtube-nocookie.com/embed/abc123',
  ...overrides,
});

describe('splitMediaLinks', () => {
  it('keeps playable videos apart from links, in the panel order', () => {
    const { videos, links } = splitMediaLinks([
      link({ id: 1 }),
      link({ id: 2, kind: 'link', url: 'https://casavogue.globo.com/x', embed_url: null }),
      link({
        id: 3,
        url: 'https://player.vimeo.com/video/42',
        embed_url: 'https://player.vimeo.com/video/42',
      }),
      link({ id: 4, url: 'https://example.com/video.mp4', embed_url: null }),
    ]);
    expect(videos.map((video) => video.id)).toEqual([1, 3]);
    expect(links.map((item) => item.id)).toEqual([2, 4]);
  });

  it('returns two empty lists when the panel has nothing', () => {
    expect(splitMediaLinks([])).toEqual({ videos: [], links: [] });
  });
});

describe('withAutoplay', () => {
  it('adds autoplay and keeps the other parameters', () => {
    expect(withAutoplay('https://www.youtube-nocookie.com/embed/abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1',
    );
    expect(withAutoplay('https://player.vimeo.com/video/42?h=9f')).toBe(
      'https://player.vimeo.com/video/42?h=9f&autoplay=1',
    );
  });
});
