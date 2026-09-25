/**
 * Loja externa da lista de orçamento (localStorage), no formato que o
 * `useSyncExternalStore` espera. Só roda no navegador. Wrapper fino sobre
 * `createLocalStore` (`lib/ui/local-store.ts`, R11): a lógica de leitura,
 * escrita, cache e sincronização entre abas vive lá.
 */
import { createLocalStore } from '@/lib/ui/local-store';
import { addItem, parseStoredItems, quoteItemKey, removeItem, setItemQuantity, type AddStatus } from './list';
import { QUOTE_STORAGE_KEY, type QuoteItem, type QuoteItemInput } from './types';

const EMPTY: QuoteItem[] = [];

const store = createLocalStore<QuoteItem[]>({
  key: QUOTE_STORAGE_KEY,
  parse: parseStoredItems,
  empty: EMPTY,
});

/** Snapshot estável: mesma referência enquanto o texto salvo não muda. */
export function getQuoteItems(): QuoteItem[] {
  return store.get();
}

export function getServerQuoteItems(): QuoteItem[] {
  return EMPTY;
}

export function subscribeQuote(listener: () => void): () => void {
  return store.subscribe(listener);
}

export const quoteActions = {
  add(input: QuoteItemInput): AddStatus {
    const result = addItem(store.get(), input);
    if (result.status !== 'full') {
      store.set(result.items);
    }
    return result.status;
  },
  setQuantity(key: string, quantity: number): void {
    store.set(setItemQuantity(store.get(), key, quantity));
  },
  remove(key: string): QuoteItem | null {
    const items = store.get();
    const removed = items.find((item) => quoteItemKey(item) === key) ?? null;
    if (removed) {
      store.set(removeItem(items, key));
    }
    return removed;
  },
  clear(): void {
    store.set([]);
  },
};

/** Só para testes: zera o estado do módulo. */
export function resetQuoteStoreForTests(): void {
  store.reset();
}
