import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Select } from './Select';

const OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
];

describe('Select', () => {
  it('submits the value through a hidden input with the same name', () => {
    const html = renderToStaticMarkup(<Select id="uf" name="state" options={OPTIONS} defaultValue="rj" />);
    expect(html).toContain('<input type="hidden" name="state" value="rj"/>');
  });

  it('renders a closed combobox that controls a hidden listbox', () => {
    const html = renderToStaticMarkup(<Select id="uf" name="state" options={OPTIONS} labelId="uf-label" />);
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).toContain('id="uf"');
    expect(button).toContain('role="combobox"');
    expect(button).toContain('aria-expanded="false"');
    expect(button).not.toContain('aria-activedescendant');
    const list = html.match(/<ul[^>]*>/)?.[0] ?? '';
    expect(list).toContain('role="listbox"');
    expect(list).toContain('hidden=""');
    expect(list).toContain('aria-labelledby="uf-label"');
    expect(button).toContain(`aria-controls="${list.match(/id="([^"]+)"/)?.[1]}"`);
  });

  it('shows the selected label and marks the selected option', () => {
    const html = renderToStaticMarkup(<Select id="uf" name="state" options={OPTIONS} defaultValue="sp" />);
    expect(html).toMatch(/class="select__value">São Paulo</);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(/data-value="sp" aria-selected="true"/);
  });

  it('falls back to the first option and passes the invalid state to the button', () => {
    const html = renderToStaticMarkup(
      <Select id="uf" name="state" options={OPTIONS} aria-invalid aria-describedby="uf-error" />,
    );
    expect(html).toContain('name="state" value=""');
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).toContain('aria-invalid="true"');
    expect(button).toContain('aria-describedby="uf-error"');
  });
});
