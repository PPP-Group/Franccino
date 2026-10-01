import { describe, expect, it } from 'vitest';
import type { Image } from '@/lib/api/types';
import { ApiImage } from './ApiImage';

// `ApiImage` is a Server Component (a plain function, no hooks), so calling
// it directly returns the React element it builds — a plain object with a
// `props` bag — without needing a DOM renderer or JSX in this `.test.ts`
// file (the project's Vitest config only picks up `*.test.ts`).

const image: Image = {
  id: 1,
  alt: 'Poltrona Franccino',
  width: 1200,
  height: 800,
  src: 'https://cdn.test/poltrona-960.jpg',
  srcset: [{ width: 960, url: 'https://cdn.test/poltrona-960.jpg' }],
  blur_data_url: null,
};

describe('ApiImage', () => {
  it('renders nothing for a null image', () => {
    expect(ApiImage({ image: null, sizes: '100vw' })).toBeNull();
  });

  it('sets width, height and an aspect-ratio style when both dimensions are known', () => {
    const element = ApiImage({ image, sizes: '100vw' })!;
    expect(element.props.width).toBe(1200);
    expect(element.props.height).toBe(800);
    expect(element.props.style).toEqual({ aspectRatio: '1200 / 800' });
  });

  it('renders without width/height/style when the original dimensions are unknown', () => {
    const element = ApiImage({ image: { ...image, width: null, height: null }, sizes: '100vw' })!;
    expect(element.props.width).toBeUndefined();
    expect(element.props.height).toBeUndefined();
    expect(element.props.style).toBeUndefined();
  });

  it('adds the blur placeholder as a contained background without an aspect-ratio when dimensions are unknown', () => {
    const element = ApiImage({
      image: { ...image, width: null, height: null, blur_data_url: 'data:image/gif;base64,AA==' },
      sizes: '100vw',
    })!;
    expect(element.props.style).toEqual({
      backgroundImage: 'url(data:image/gif;base64,AA==)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    });
  });

  it('sets loading=eager and fetchPriority=high when priority is true, lazy otherwise', () => {
    expect(ApiImage({ image, sizes: '100vw' })!.props.loading).toBe('lazy');
    expect(ApiImage({ image, sizes: '100vw' })!.props.fetchPriority).toBeUndefined();

    const priorityElement = ApiImage({ image, sizes: '100vw', priority: true })!;
    expect(priorityElement.props.loading).toBe('eager');
    expect(priorityElement.props.fetchPriority).toBe('high');
  });
});
