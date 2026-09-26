import type { Locale } from '@/i18n/config';

export const QUOTE_STORAGE_KEY = 'franccino.quote.v1';
/** Limites do contrato (`POST /contact`, `items`). */
export const MAX_QUOTE_ITEMS = 50;
export const MAX_QUANTITY = 99;
export const MAX_FINISHES = 10;
export const MAX_NOTE_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 5000;

export type QuoteFinish = { id: number; group: string; name: string; code: string | null };
export type QuoteImage = { src: string; alt: string };

/**
 * Item salvo no navegador: um retrato da peça no momento em que entrou na lista, para a
 * página da lista renderizar sem chamar a API. `locale` é o idioma do slug e do nome.
 */
export type QuoteItem = {
  productId: number;
  slug: string;
  locale: Locale;
  name: string;
  image: QuoteImage | null;
  finishes: QuoteFinish[];
  quantity: number;
  note: string;
};

export type QuoteItemInput = Omit<QuoteItem, 'quantity' | 'note'> & { quantity?: number; note?: string };
