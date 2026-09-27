import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { DimensionsBlock } from './DimensionsBlock';

const chair = { label: null, width: 520, depth: 560, height: 800, seat_height: 460, diameter: null };

describe('DimensionsBlock', () => {
  it('lists the measures in cm with a described drawing', () => {
    const html = renderWithIntl(<DimensionsBlock dimensions={[chair]} />);
    expect(html).toContain('<dt>Largura</dt><dd>52</dd>');
    expect(html).toContain('<dt>Altura do assento</dt><dd>46</dd>');
    expect(html).toContain(
      'aria-label="Desenho técnico com as medidas: largura 52 cm, profundidade 56 cm, altura 80 cm, altura do assento 46 cm"',
    );
    expect(html).not.toContain('role="tablist"');
  });

  it('switches to diameter for round pieces and offers tabs for variants', () => {
    const round = {
      label: 'Redonda',
      width: null,
      depth: null,
      height: 750,
      seat_height: null,
      diameter: 1300,
    };
    const html = renderWithIntl(<DimensionsBlock dimensions={[round, { ...chair, label: 'Retangular' }]} />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('<dt>Diâmetro</dt><dd>130</dd>');
    expect(html).toContain('Retangular');
  });

  it('renders nothing when there are no values', () => {
    const empty = { label: null, width: null, depth: null, height: null, seat_height: null, diameter: null };
    expect(renderWithIntl(<DimensionsBlock dimensions={[empty]} />)).toBe('');
  });
});
