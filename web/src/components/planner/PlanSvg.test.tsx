import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlannerProduct } from '@/lib/planner/types';
import { PlanSvg } from './PlanSvg';

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};
const table: PlannerProduct = { ...sofa, id: 8, name: 'Mesa Joey', width: 130, depth: 130, shape: 'round' };

describe('PlanSvg', () => {
  it('draws an image of an empty room with measures', () => {
    const html = renderToStaticMarkup(
      <PlanSvg
        room={{ w: 500, d: 400 }}
        pieces={[]}
        label="Planta 5,00 por 4,00 m"
        widthLabel="5,00 m"
        depthLabel="4,00 m"
      />,
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('viewBox="-60 -60 620 520"');
    expect(html).toContain('5,00 m');
  });

  it('draws pieces to scale with selection and conflict states', () => {
    const html = renderToStaticMarkup(
      <PlanSvg
        room={{ w: 500, d: 400 }}
        pieces={[
          { piece: { uid: 1, productId: 7, x: 130, y: 280, r: 0 }, product: sofa },
          { piece: { uid: 2, productId: 8, x: 190, y: 170, r: 0 }, product: table },
        ]}
        selectedUid={1}
        conflicts={new Set([2])}
        label="Planta"
        widthLabel="5,00 m"
        depthLabel="4,00 m"
        pieceText={(entry) => ({ name: entry.product.name, size: '' })}
        pieceProps={() => ({ tabIndex: 0 })}
      />,
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('class="piece is-selected"');
    expect(html).toContain('class="piece is-conflict"');
    expect(html).toContain('<rect width="240" height="100"');
    expect(html).toContain('<ellipse cx="65" cy="65" rx="65" ry="65"');
    expect(html).toContain('Sofá Majestic');
  });
});
