import { describe, expect, it } from 'vitest';
import { isChunkLoadError } from './chunk-reload';

describe('isChunkLoadError', () => {
  it('reconhece o script que não carregou', () => {
    expect(isChunkLoadError({ name: 'ChunkLoadError', message: 'Loading chunk 12 failed.' })).toBe(true);
    expect(isChunkLoadError(new Error('Failed to load chunk /_next/static/chunks/abc.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /x.js'))).toBe(true);
  });

  it('ignora os outros erros', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});
