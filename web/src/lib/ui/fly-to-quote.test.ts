import { afterEach, describe, expect, it, vi } from 'vitest';
import { flyPath, mostlyVisible, originBox, revealHeader } from './fly-to-quote';

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

describe('revealHeader', () => {
  afterEach(() => vi.unstubAllGlobals());

  function root(hidden: boolean) {
    const attrs = new Set(hidden ? ['data-header-hide'] : []);
    return {
      hasAttribute: (name: string) => attrs.has(name),
      removeAttribute: (name: string) => attrs.delete(name),
      attrs,
    };
  }

  it('traz o cabeçalho escondido de volta e espera ele chegar', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    const el = root(true);
    expect(revealHeader(el as unknown as HTMLElement)).toBeGreaterThan(0);
    expect(el.attrs.has('data-header-hide')).toBe(false);
  });

  it('não espera nada com o cabeçalho à vista', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    expect(revealHeader(root(false) as unknown as HTMLElement)).toBe(0);
  });
});

describe('saída do voo', () => {
  it('considera a foto à vista com metade ou mais dentro da tela', () => {
    expect(mostlyVisible({ left: 0, top: 100, width: 300, height: 200 }, 800)).toBe(true);
    expect(mostlyVisible({ left: 0, top: -90, width: 300, height: 200 }, 800)).toBe(true);
    expect(mostlyVisible({ left: 0, top: -150, width: 300, height: 200 }, 800)).toBe(false);
    expect(mostlyVisible({ left: 0, top: 720, width: 300, height: 200 }, 800)).toBe(false);
  });

  it('sem a foto à vista, sai de um quadrado logo acima do centro do botão', () => {
    expect(originBox({ left: 500, top: 600, width: 300, height: 48 })).toEqual({
      left: 614,
      top: 528,
      width: 72,
      height: 72,
    });
  });
});
