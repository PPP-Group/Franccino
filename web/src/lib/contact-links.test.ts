import { describe, expect, it } from 'vitest';
import { telHref, whatsappUrl } from './contact-links';

describe('contact links', () => {
  it('builds wa.me links with digits only and encoded text', () => {
    expect(whatsappUrl('5511942900080')).toBe('https://wa.me/5511942900080');
    expect(whatsappUrl('+55 (11) 94290-0080', 'Olá! 2 × Aura')).toBe(
      'https://wa.me/5511942900080?text=Ol%C3%A1!%202%20%C3%97%20Aura',
    );
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl('')).toBeNull();
  });

  it('builds tel links with the Brazilian prefix when missing', () => {
    expect(telHref('(37) 3381-4204')).toBe('tel:+553733814204');
    expect(telHref('(11) 98604-5126')).toBe('tel:+5511986045126');
    expect(telHref('+1 212 555 0100')).toBe('tel:+12125550100');
  });
});
