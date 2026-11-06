import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { HeroCarousel } from './HeroCarousel';

describe('HeroCarousel', () => {
  it('stacks every slide for the crossfade, with only the first active and only a keyboard pause control', () => {
    const html = renderWithIntl(
      <HeroCarousel>
        <p>slide-a</p>
        <p>slide-b</p>
        <p>slide-c</p>
      </HeroCarousel>,
    );
    expect(html).toContain('aria-roledescription="carrossel"');
    expect(html).toContain('aria-label="1 de 3"');
    expect(html.match(/class="hero-carousel__slide is-active"/g)).toHaveLength(1);
    // Os outros slides estão no HTML (a fusão precisa deles), mas fora do teclado e do leitor de tela.
    expect(html.match(/inert=""/g)).toHaveLength(2);
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(2);
    expect(html.indexOf('slide-a')).toBeLessThan(html.indexOf('inert=""'));
    expect(html).toContain('slide-c');
    expect(html).toContain('Pausar a troca automática');
    expect(html).toContain('hero-carousel__pause');
    expect(html).not.toContain('hero-carousel__dot');
    expect(html).not.toContain('Próximo destaque');
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
