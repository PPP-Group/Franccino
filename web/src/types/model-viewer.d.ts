/**
 * Minimal typing for the `<model-viewer>` custom element registered by
 * `@google/model-viewer` (the package ships no `.d.ts`). Only the attributes
 * `ModelViewer` (`@/components/products/ModelViewer.tsx`) actually uses are
 * declared; extend as needed.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// React 19's automatic JSX runtime type-checks elements against the `JSX`
// namespace re-exported from the `react` module itself (`react/jsx-runtime`
// does `export { JSX } from '.'`), not a bare ambient global `JSX` namespace
// — so the custom element is declared via `declare module 'react'`, the
// same pattern renderers like `react-dom` use to augment `IntrinsicElements`.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
      };
    }
  }
}

export {};
