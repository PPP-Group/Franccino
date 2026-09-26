import type { ContactItem } from '@/lib/api/forms';
import { MAX_MESSAGE_LENGTH, type QuoteFinish, type QuoteItem } from './types';

export function formatFinishes(finishes: QuoteFinish[], pendingLabel: string): string {
  if (finishes.length === 0) {
    return pendingLabel;
  }
  return finishes
    .map((finish) => (finish.code ? `${finish.name} (${finish.code})` : finish.name))
    .join(' · ');
}

export function quoteLine(item: QuoteItem, pendingLabel: string): string {
  const line = `${item.quantity} × ${item.name} (${formatFinishes(item.finishes, pendingLabel)})`;
  return item.note ? `${line} — ${item.note}` : line;
}

export function buildWhatsAppText(items: QuoteItem[], intro: string, pendingLabel: string): string {
  return [intro, ...items.map((item) => `• ${quoteLine(item, pendingLabel)}`)].join('\n');
}

/** `message` do contato (obrigatório na API): observações digitadas + a lista legível no e-mail. */
export function buildQuoteMessage(
  items: QuoteItem[],
  typed: string,
  heading: string,
  pendingLabel: string,
): string {
  const list = [heading, ...items.map((item) => `• ${quoteLine(item, pendingLabel)}`)].join('\n');
  const notes = typed.trim();
  const text = notes ? `${notes}\n\n${list}` : list;
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : text;
}

export function toContactItems(items: QuoteItem[]): ContactItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    ...(item.finishes.length > 0 ? { finish_ids: item.finishes.map((finish) => finish.id) } : {}),
    ...(item.note ? { note: item.note } : {}),
  }));
}
