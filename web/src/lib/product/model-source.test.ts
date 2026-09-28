import { describe, expect, it } from 'vitest';
import { modelSourceForAttempt } from './model-source';

describe('modelSourceForAttempt', () => {
  it('keeps the original url on the first attempt', () => {
    expect(modelSourceForAttempt('https://cdn.example.com/m/aura.glb', 0)).toBe(
      'https://cdn.example.com/m/aura.glb',
    );
  });

  it('adds a retry marker so the viewer does not reuse its cached failure', () => {
    expect(modelSourceForAttempt('https://cdn.example.com/m/aura.glb', 2)).toBe(
      'https://cdn.example.com/m/aura.glb?retry=2',
    );
    expect(modelSourceForAttempt('https://cdn.example.com/m/aura.glb?v=3', 1)).toBe(
      'https://cdn.example.com/m/aura.glb?v=3&retry=1',
    );
  });
});
