import { describe, expect, it } from 'vitest';
import { logoBox } from './logo-box';

describe('logoBox', () => {
  it('dá a mesma área a logos de proporções diferentes', () => {
    const wide = logoBox(1080, 252);
    const compact = logoBox(278, 154);
    expect(wide.height).toBeLessThan(compact.height);
    expect(Math.abs(wide.width * wide.height - compact.width * compact.height)).toBeLessThan(1200);
  });

  it('respeita a largura e a altura máximas', () => {
    expect(logoBox(2000, 100).width).toBe(250);
    expect(logoBox(100, 200).height).toBe(80);
  });

  it('sem medidas, usa uma proporção comum', () => {
    expect(logoBox(null, null)).toEqual(logoBox(250, 100));
  });
});
