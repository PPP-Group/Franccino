import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { MediaLinks } from './MediaLinks';

describe('MediaLinks', () => {
  it('renders a click-to-load player for videos and opens links in a new tab', () => {
    const html = renderWithIntl(
      <MediaLinks
        headingId="media"
        items={[
          {
            id: 1,
            kind: 'video',
            title: 'Making of',
            url: 'https://youtu.be/abc123',
            embed_url: 'https://www.youtube-nocookie.com/embed/abc123',
          },
          { id: 2, kind: 'link', title: 'Casa Vogue', url: 'https://casavogue.globo.com/x', embed_url: null },
        ]}
      />,
    );
    expect(html).toContain('Vídeos e links');
    expect(html).toContain('Assistir ao vídeo: Making of');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('href="https://casavogue.globo.com/x"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders nothing without items', () => {
    expect(renderWithIntl(<MediaLinks headingId="media" items={[]} />)).toBe('');
  });
});
