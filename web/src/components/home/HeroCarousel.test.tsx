import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { HeroCarousel } from './HeroCarousel';

describe('HeroCarousel', () => {
  it('shows the first slide and hides the others, with labelled controls', () => {
    const html = renderWithIntl(
      <HeroCarousel>
        <p>slide-a</p>
        <p>slide-b</p>
        <p>slide-c</p>
      </HeroCarousel>,
    );
    expect(html).toContain('aria-roledescription="carrossel"');
    expect(html).toContain('aria-label="1 de 3"');
    expect(html.match(/hidden=""/g)).toHaveLength(2);
    expect(html.indexOf('slide-a')).toBeLessThan(html.indexOf('hidden=""'));
    expect(html).toContain('aria-label="Próximo destaque"');
    expect(html).toContain('aria-label="Destaque anterior"');
    expect(html).toContain('aria-label="Pausar a troca automática"');
    expect(html).toContain('aria-current="true"');
    expect(html.match(/hero-carousel__dot"/g)).toHaveLength(3);
  });

  it('renders a single slide without carousel chrome', () => {
    const html = renderWithIntl(
      <HeroCarousel>
        <p>only</p>
      </HeroCarousel>,
    );
    expect(html).toContain('only');
    expect(html).not.toContain('hero-carousel');
  });
});
