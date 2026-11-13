import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { PageVideo } from './PageVideo';

const poster = (width: number, height: number) => ({
  id: 1,
  alt: '',
  width,
  height,
  src: 'https://api.test/capa.jpg',
  srcset: [],
  blur_data_url: null,
});

describe('PageVideo', () => {
  it('keeps a vertical film vertical, following its cover', () => {
    const html = renderWithIntl(
      <PageVideo
        video={{ url: 'https://api.test/manifesto.mp4', poster: poster(1080, 1920) }}
        title="Manifesto"
        id="v"
      />,
    );
    expect(html).toContain('page-video--portrait');
    expect(html).toContain('--video-ratio:0.5625');
    expect(html).toContain('capa.jpg');
  });

  it('is a wide frame without a cover', () => {
    const html = renderWithIntl(
      <PageVideo video={{ url: 'https://api.test/clara.mp4', poster: null }} title="Clara" id="v" />,
    );
    expect(html).not.toContain('page-video--portrait');
  });
});
