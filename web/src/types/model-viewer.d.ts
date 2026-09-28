/**
 * Minimal typing for the `<model-viewer>` custom element registered by
 * `@google/model-viewer` (the package ships no `.d.ts`). Only the attributes
 * `ModelViewer` (`@/components/products/ModelViewer.tsx`) actually uses are
 * declared; extend as needed.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src: string;
  alt?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'shadow-intensity'?: string;
  exposure?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'manual';
  poster?: string;
};

// React 19's automatic JSX runtime type-checks elements against the `JSX`
// namespace re-exported from the `react` module itself (`react/jsx-runtime`
// does `export { JSX } from '.'`), not a bare ambient global `JSX` namespace
// — so the custom element is declared via `declare module 'react'`, the
// same pattern renderers like `react-dom` use to augment `IntrinsicElements`.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}

export {};
