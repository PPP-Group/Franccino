import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: ['·', '—', '/', '|', '×', '→', '+', '©'] },
      ],
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
  {
    // The one deliberate exception to "zero literal text in JSX": this file
    // replaces the root layout for errors thrown above `[locale]/layout.tsx`,
    // where next-intl's provider and the current locale are both
    // unavailable — see the comment in `global-error.tsx`.
    files: ['src/app/global-error.tsx'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
