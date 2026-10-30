import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountUp } from './CountUp';

describe('CountUp', () => {
  it('sends the final value in the server HTML, once for the eyes and once for screen readers', () => {
    const html = renderToStaticMarkup(<CountUp value="+25 anos" />);
    expect(html).toContain('<span aria-hidden="true">+25 anos</span>');
    expect(html).toContain('<span class="visually-hidden">+25 anos</span>');
  });

  it('prints text without a number as it is', () => {
    expect(renderToStaticMarkup(<CountUp value="Cláudio (MG)" />)).toBe('Cláudio (MG)');
  });
});
