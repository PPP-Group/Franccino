import { z } from 'zod';
import {
  MAX_FINISHES,
  MAX_NOTE_LENGTH,
  MAX_QUANTITY,
  MAX_QUOTE_ITEMS,
  type QuoteItem,
  type QuoteItemInput,
} from './types';

export type AddStatus = 'added' | 'merged' | 'full';
export type AddResult = { items: QuoteItem[]; status: AddStatus };

/** Mesma peça com os mesmos acabamentos (em qualquer ordem) é o mesmo item. */
export function quoteItemKey(item: Pick<QuoteItem, 'productId' | 'finishes'>): string {
  const ids = item.finishes.map((finish) => finish.id).sort((a, b) => a - b);
  return `${item.productId}:${ids.join(',')}`;
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)));
}

export function addItem(items: QuoteItem[], input: QuoteItemInput): AddResult {
  const finishes = input.finishes.slice(0, MAX_FINISHES);
  const quantity = clampQuantity(input.quantity ?? 1);
  const note = (input.note ?? '').trim().slice(0, MAX_NOTE_LENGTH);
  const key = quoteItemKey({ productId: input.productId, finishes });
  const index = items.findIndex((item) => quoteItemKey(item) === key);

  if (index >= 0) {
    return {
      status: 'merged',
      items: items.map((item, i) =>
        i === index
          ? { ...item, quantity: clampQuantity(item.quantity + quantity), note: note || item.note }
          : item,
      ),
    };
  }

  if (items.length >= MAX_QUOTE_ITEMS) {
    return { items, status: 'full' };
  }

  const added: QuoteItem = {
    productId: input.productId,
    slug: input.slug,
    locale: input.locale,
    name: input.name,
    image: input.image,
    finishes,
    quantity,
    note,
  };
  return { status: 'added', items: [...items, added] };
}

export function setItemQuantity(items: QuoteItem[], key: string, quantity: number): QuoteItem[] {
  return items.map((item) =>
    quoteItemKey(item) === key ? { ...item, quantity: clampQuantity(quantity) } : item,
  );
}

export function removeItem(items: QuoteItem[], key: string): QuoteItem[] {
  return items.filter((item) => quoteItemKey(item) !== key);
}

export function totalQuantity(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const itemSchema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().min(1),
  locale: z.enum(['pt', 'en']),
  name: z.string().min(1),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
  finishes: z
    .array(
      z.object({ id: z.number().int(), group: z.string(), name: z.string(), code: z.string().nullable() }),
    )
    .max(MAX_FINISHES),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  note: z.string().max(MAX_NOTE_LENGTH),
});

/** Lê o que está salvo, descartando entradas inválidas (inclusive o formato do protótipo). */
export function parseStoredItems(raw: string | null): QuoteItem[] {
  if (!raw) {
    return [];
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) {
    return [];
  }
  const items: QuoteItem[] = [];
  for (const entry of data) {
    const parsed = itemSchema.safeParse(entry);
    if (parsed.success) {
      items.push(parsed.data);
    }
  }
  return items.slice(0, MAX_QUOTE_ITEMS);
}
