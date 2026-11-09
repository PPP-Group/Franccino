import { describe, expect, it } from 'vitest';
import { parallaxShift } from './parallax';

describe('parallaxShift', () => {
  it('vai de -1 ao entrar por baixo a 1 ao sair por cima', () => {
    expect(parallaxShift(900, 600, 900)).toBe(-1);
    expect(parallaxShift(150, 600, 900)).toBe(0);
    expect(parallaxShift(-600, 600, 900)).toBe(1);
  });

  it('fica no limite fora da tela', () => {
    expect(parallaxShift(2000, 600, 900)).toBe(-1);
    expect(parallaxShift(-3000, 600, 900)).toBe(1);
  });
});
