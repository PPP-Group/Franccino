import { useSyncExternalStore } from 'react';
import { totalQuantity } from './list';
import { getQuoteItems, getServerQuoteItems, subscribeQuote } from './store';
import type { QuoteItem } from './types';

/** Itens da lista; vazio no servidor e na hidratação (use `useIsClient` para não piscar o vazio). */
export function useQuoteItems(): QuoteItem[] {
  return useSyncExternalStore(subscribeQuote, getQuoteItems, getServerQuoteItems);
}

export function useQuoteCount(): number {
  return totalQuantity(useQuoteItems());
}
