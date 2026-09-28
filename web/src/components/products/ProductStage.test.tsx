import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductStage } from './ProductStage';

describe('ProductStage', () => {
  it('shows only photos when there is no 3d model, with the first image eager', () => {
    const html = renderWithIntl(<ProductStage images={[image()]} name="Cadeira Aura" model={null} />);
    expect(html).not.toContain('aria-pressed');
    expect(html).toContain('loading="eager"');
  });

  it('offers the 3d toggle but starts on photos on the server', () => {
    const html = renderWithIntl(
      <ProductStage
        images={[image()]}
        name="Cadeira Aura"
        model={{ url: 'https://cdn.test/aura.glb', size: null }}
      />,
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('<model-viewer');
  });

  it('shows thumbnails only when there is more than one image', () => {
    const html = renderWithIntl(
      <ProductStage images={[image({ id: 1 }), image({ id: 2 })]} name="Aura" model={null} />,
    );
    expect(html).toContain('class="thumbs"');
    expect(html).toContain('aria-label="Foto 2 de 2"');
  });
});
