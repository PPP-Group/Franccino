import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders a decorative svg with the icon class', () => {
    const html = renderToStaticMarkup(<Icon name="plus" className="extra" />);
    expect(html).toContain('class="icon extra"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 24 24"');
  });
});
