import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[{ type: 'timeline', data: { items: [{ year: '2000', title: '<b>x</b>', text: 'y' }] } }]}
      />,
    );
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('class="timeline"');
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
