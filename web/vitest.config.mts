import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      // `next` ships `navigation.js` without an `exports` map and next-intl
      // imports it extension-less (`from 'next/navigation'`). Vite's ESM
      // resolver — unlike Node's CJS `require` or a real Next.js bundler —
      // doesn't guess extensions for that, so point straight at the file.
      { find: /^next\/navigation$/, replacement: `${dirname}node_modules/next/navigation.js` },
    ],
  },
  ssr: {
    // Forces Vite (rather than plain Node) to resolve `next-intl`, so the
    // alias above actually applies instead of the package being loaded
    // as-is via Node's stricter ESM resolution.
    noExternal: ['next-intl'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      API_URL: 'http://localhost:8000',
      SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    },
  },
});
