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
    expect(html).toContain('href="/room-planner"');
    expect(html).toContain('16 designers');
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
