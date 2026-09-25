import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, buildWhatsAppText, formatFinishes, quoteLine, toContactItems } from './message';
import type { QuoteItem } from './types';

const item = (overrides: Partial<QuoteItem> = {}): QuoteItem => ({
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt',
  name: 'Cadeira Aura',
  image: null,
  finishes: [
    { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' },
    { id: 201, group: 'Tecido', name: 'Linho cru', code: null },
  ],
  quantity: 6,
  note: '',
  ...overrides,
});

describe('quote messages', () => {
  it('formats finishes with codes, or the pending label', () => {
    expect(formatFinishes(item().finishes, 'a definir')).toBe('Nogueira (MD-05) · Linho cru');
    expect(formatFinishes([], 'a definir')).toBe('a definir');
  });

  it('builds one line per item with the note', () => {
    expect(quoteLine(item({ note: 'Sala 5,0 × 4,0 m' }), 'a definir')).toBe(
      '6 × Cadeira Aura (Nogueira (MD-05) · Linho cru) — Sala 5,0 × 4,0 m',
    );
  });

  it('builds the whatsapp text with an intro and bullets', () => {
    const items = [item(), item({ name: 'Sofá Majestic', quantity: 1, finishes: [] })];
    expect(buildWhatsAppText(items, 'Olá!', 'a definir')).toBe(
      'Olá!\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)\n• 1 × Sofá Majestic (a definir)',
    );
  });

  it('puts the typed notes before the list and caps the size', () => {
    expect(buildQuoteMessage([item()], '  Entrega em BH  ', 'Peças:', 'a definir')).toBe(
      'Entrega em BH\n\nPeças:\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)',
    );
    expect(buildQuoteMessage([item()], '', 'Peças:', 'a definir')).toBe(
      'Peças:\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)',
    );
    expect(buildQuoteMessage([item()], 'x'.repeat(6000), 'Peças:', 'a definir')).toHaveLength(5000);
  });

  it('maps items to the contact payload', () => {
    expect(
      toContactItems([item({ note: 'Varanda' }), item({ productId: 13, finishes: [], quantity: 1 })]),
    ).toEqual([
      { product_id: 12, quantity: 6, finish_ids: [101, 201], note: 'Varanda' },
      { product_id: 13, quantity: 1 },
    ]);
  });
});
