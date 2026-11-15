import { describe, expect, it } from 'vitest';
import { flyPath, mostlyVisible, originBox } from './fly-to-quote';

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
