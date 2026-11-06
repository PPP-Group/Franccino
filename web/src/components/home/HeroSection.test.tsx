import { describe, expect, it, vi } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { HeroSection } from './HeroSection';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('HeroSection', () => {
  it('uses the banner text, image and call to action', () => {
    const html = renderWithIntl(
      <HeroSection
        banner={{
          title: 'Casa e jardim no mesmo desenho',
          subtitle: null,
          cta_label: 'Conhecer a coleção',
          cta_url: 'https://franccino.com.br/pt/colecoes/tempo',
          image: image(),
          image_mobile: image({ id: 2 }),
          video: null,
        }}
        brandNames={['Franccino Casa', 'Franccino Giardini']}
        designerCount={16}
      />,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('Casa e jardim no mesmo desenho');
    expect(html).toContain('href="https://franccino.com.br/pt/colecoes/tempo"');
    expect(html).toContain('<source media=');
    expect(html).toContain('loading="eager"');
    // Banner com foto: só o que foi cadastrado, sem os atalhos e a contagem da placa sem foto.
    expect(html).not.toContain('href="/room-planner"');
    expect(html).not.toContain('16 designers');
    expect(html).not.toContain('hero__link');
  });

  it('writes nothing over a banner without text, keeps the title for screen readers and links the whole banner', () => {
    const html = renderWithIntl(
      <HeroSection
        banner={{
          title: null,
          subtitle: null,
          cta_label: null,
          cta_url: '/pt/lancamentos',
          image: image({ alt: 'Coleção Tempo' }),
          image_mobile: null,
          video: 'https://media.example.com/banners/tempo.mp4',
        }}
        brandNames={['Franccino Casa']}
        designerCount={16}
      />,
    );
    expect(html).toContain('hero--clean');
    expect(html).toMatch(/<h1 class="visually-hidden" id="hero-title">Móveis de design autoral<\/h1>/);
    expect(html).not.toContain('hero__plate');
    expect(html).not.toContain('class="btn');
    expect(html).toContain('class="hero__link" href="/pt/lancamentos" aria-label="Coleção Tempo"');
    // O vídeo só entra depois da hidratação (movimento reduzido é o padrão no servidor): a foto é o que vai no HTML.
    expect(html).not.toContain('<video');
    expect(html).toContain('<img');
  });

  it('follows the ratio of a wide marketing strip instead of cropping it, keeping the tall banner on mobile', () => {
    const strip = image({ width: 1920, height: 500 });
    const banner = {
      title: null,
      subtitle: null,
      cta_label: null,
      cta_url: null,
      image: strip,
      image_mobile: null,
      video: null,
    };
    const html = renderWithIntl(<HeroSection banner={banner} brandNames={[]} designerCount={0} />);
    expect(html).toContain('class="hero hero--clean hero--fit"');
    expect(html).toContain('--hero-ratio:1920 / 500');
    expect(html).toContain('sizes="100vw"');

    const withMobile = renderWithIntl(
      <HeroSection
        banner={{ ...banner, image_mobile: image({ id: 2, width: 900, height: 1200 }) }}
        brandNames={[]}
        designerCount={0}
      />,
    );
    expect(withMobile).toContain('hero--fit hero--fit-desktop');
    expect(withMobile).toContain('sizes="max(100vw, calc(clamp(560px, 82vh, 920px) * 0.75))"');
  });

  it('keeps the tall banner for a photo and asks for the width drawn by the crop', () => {
    const html = renderWithIntl(
      <HeroSection
        banner={{
          title: null,
          subtitle: null,
          cta_label: null,
          cta_url: null,
          image: image({ width: 1500, height: 1000 }),
          image_mobile: null,
          video: null,
        }}
        brandNames={[]}
        designerCount={0}
      />,
    );
    expect(html).not.toContain('hero--fit');
    expect(html).toContain('sizes="max(100vw, calc(clamp(560px, 82vh, 920px) * 1.5))"');
  });

  it('uses the box of the first slide when the carousel passes it', () => {
    const html = renderWithIntl(
      <HeroSection
        index={1}
        frame={{ kind: 'fit', width: 1920, height: 500 }}
        banner={{
          title: null,
          subtitle: null,
          cta_label: null,
          cta_url: null,
          image: image({ width: 1600, height: 1200 }),
          image_mobile: null,
          video: null,
        }}
        brandNames={[]}
        designerCount={0}
      />,
    );
    expect(html).toContain('hero--fit');
    expect(html).toContain('--hero-ratio:1920 / 500');
  });

  it('falls back to a plain plate without inventing an image', () => {
    const html = renderWithIntl(<HeroSection banner={null} brandNames={[]} designerCount={0} />);
    expect(html).toContain('hero--plain');
    expect(html).not.toContain('<img');
    expect(html).toContain('href="/products"');
    expect(html).not.toContain('designers');
  });

  it('renders a banner with every optional field empty without inventing copy (R19)', () => {
    const html = renderWithIntl(
      <HeroSection
        banner={{
          title: null,
          subtitle: null,
          cta_label: null,
          cta_url: null,
          image: null,
          image_mobile: null,
          video: null,
        }}
        brandNames={[]}
        designerCount={0}
      />,
    );
    expect(html).toContain('hero--plain');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<source');
    expect(html).toContain('Móveis de design autoral');
    expect(html).not.toContain('class="lead"');
    expect(html).toContain('href="/products"');
  });
});
