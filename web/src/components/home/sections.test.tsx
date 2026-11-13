import { describe, expect, it, vi } from 'vitest';
import type { CollectionCard, ProjectCard } from '@/lib/api/types';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { CollectionsSection, stripLayout } from './CollectionsSection';
import { designersShown } from './DesignersSection';
import { mosaicCount, ProjectsSection } from './ProjectsSection';
import { alternateTones, sectionClass } from './tone';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

function collection(id: number, overrides: Partial<CollectionCard> = {}): CollectionCard {
  return {
    id,
    slug: `colecao-${id}`,
    name: `Coleção ${id}`,
    year: null,
    summary: null,
    cover: image({ id, width: 1920, height: 500 }),
    product_count: 4,
    ...overrides,
  };
}

function project(id: number, overrides: Partial<ProjectCard> = {}): ProjectCard {
  return {
    id,
    slug: `projeto-${id}`,
    type: 'residential',
    title: `Projeto ${id}`,
    client_name: 'Cliente',
    location: 'Belo Horizonte',
    year: null,
    summary: null,
    cover: image({ id, width: 2560, height: 1707 }),
    ...overrides,
  };
}

describe('tones', () => {
  it('alternates white and sand from white', () => {
    expect(alternateTones(4)).toEqual(['paper', 'sand', 'paper', 'sand']);
    expect(sectionClass('sand', 'feature')).toBe('section section--sand feature');
  });
});

describe('stripLayout', () => {
  it('pairs half strips under a wide one and never leaves a half strip alone', () => {
    expect(stripLayout(6)).toEqual(['wide', 'half', 'half', 'wide', 'half', 'half']);
    expect(stripLayout(5)).toEqual(['wide', 'half', 'half', 'wide', 'wide']);
    expect(stripLayout(4)).toEqual(['wide', 'half', 'half', 'wide']);
    expect(stripLayout(2)).toEqual(['wide', 'wide']);
  });
});

describe('CollectionsSection', () => {
  it('shows only collections with a cover, at most six, with the piece count', () => {
    const list = [...Array.from({ length: 7 }, (_, i) => collection(i + 1)), collection(9, { cover: null })];
    const html = renderWithIntl(<CollectionsSection collections={list} tone="sand" />);
    expect(html).toContain('section section--sand');
    expect(html.match(/class="strip strip--/g)).toHaveLength(6);
    expect(html).not.toContain('Coleção 7');
    expect(html).toContain('4 peças');
    expect(html).toContain('hover-zoom');
    expect(html).toContain('data-reveal="curtain"');
  });
});

describe('ProjectsSection', () => {
  it('builds the mosaic in groups of three and flips the second group', () => {
    expect(mosaicCount(7)).toBe(6);
    expect(mosaicCount(4)).toBe(3);
    expect(mosaicCount(2)).toBe(2);
    const html = renderWithIntl(
      <ProjectsSection projects={Array.from({ length: 6 }, (_, i) => project(i + 1))} tone="paper" />,
    );
    expect(html.match(/class="mosaic mosaic--3/g)).toHaveLength(2);
    expect(html).toContain('mosaic--3 mosaic--flip');
    expect(html).toContain('Cliente · Belo Horizonte');
    expect(html).toContain(
      'sizes="(max-width: 56.25rem) 94vw, max(55vw, calc(clamp(560px, 82vh, 860px) * 1.5))"',
    );
  });

  it('skips projects without a cover and keeps a short list in one row', () => {
    const html = renderWithIntl(
      <ProjectsSection projects={[project(1), project(2), project(3, { cover: null })]} tone="paper" />,
    );
    expect(html).toContain('mosaic mosaic--2');
    expect(html).not.toContain('Projeto 3');
  });
});

describe('designersShown', () => {
  it('fills the row: four with four or more, else one column each', () => {
    expect(designersShown(9)).toBe(4);
    expect(designersShown(3)).toBe(3);
  });
});
