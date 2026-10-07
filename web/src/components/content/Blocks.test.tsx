import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { Blocks } from './Blocks';

describe('Blocks', () => {
  it('renders nothing for an empty list', () => {
    expect(renderToStaticMarkup(<Blocks blocks={[]} />)).toBe('');
  });

  it('renders faq items as native disclosure widgets', () => {
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[
          { type: 'faq', data: { items: [{ question: 'Entregam em todo o Brasil?', answer: 'Resposta.' }] } },
        ]}
      />,
    );
    expect(html).toContain(
      '<div class="faq"><details><summary>Entregam em todo o Brasil?</summary><p>Resposta.</p></details></div>',
    );
  });

  it('keeps plain-text fields as text, never HTML', () => {
    const html = renderWithIntl(
      <Blocks
        blocks={[{ type: 'timeline', data: { items: [{ year: '2000', title: '<b>x</b>', text: 'y' }] } }]}
      />,
    );
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('class="timeline"');
  });

  it('lays the timeline out horizontally, one fact per line of text', () => {
    const html = renderWithIntl(
      <Blocks
        blocks={[
          {
            type: 'timeline',
            data: { items: [{ year: '2000', title: 'Fundação', text: 'Primeira loja\nPrimeira fábrica' }] },
          },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Linha do tempo"');
    expect(html).toContain('<li>Primeira loja</li><li>Primeira fábrica</li>');
  });

  it('plays YouTube or Vimeo videos only on click and links any other address', () => {
    const player = renderWithIntl(
      <Blocks
        blocks={[
          {
            type: 'video',
            data: {
              url: 'https://youtu.be/OG_GNCn0HoQ',
              embed_url: 'https://www.youtube-nocookie.com/embed/OG_GNCn0HoQ',
              poster: 'https://api.test/media/pages/video.png',
              title: 'Conheça a Franccino',
            },
          },
        ]}
      />,
    );
    expect(player).toContain('video__poster');
    expect(player).not.toContain('<iframe');

    const link = renderWithIntl(
      <Blocks
        blocks={[
          {
            type: 'video',
            data: { url: 'https://example.com/v.mp4', embed_url: null, poster: null, title: null },
          },
        ]}
      />,
    );
    expect(link).toContain('href="https://example.com/v.mp4"');
  });

  it('renders the call to action as a button link', () => {
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[{ type: 'cta', data: { heading: null, body: null, label: 'Ver lojas', url: '/pt/lojas' } }]}
      />,
    );
    expect(html).toContain('<a class="btn" href="/pt/lojas">Ver lojas</a>');
  });
});
