import { describe, expect, it } from 'vitest';
import { flyPath } from './fly-to-quote';

describe('flyPath', () => {
  it('sai do centro da foto, num quadrado do menor lado, e termina no centro do ícone', () => {
    const path = flyPath(
      { left: 100, top: 400, width: 300, height: 200 },
      { left: 1200, top: 20, width: 20, height: 20 },
    );
    expect(path.size).toBe(200);
    expect(path.left).toBe(150);
    expect(path.top).toBe(400);
    expect(path.dx).toBe(1210 - 250);
    expect(path.dy).toBe(30 - 500);
    expect(path.endScale).toBeCloseTo(14 / 200);
  });
});
