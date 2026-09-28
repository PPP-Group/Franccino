/**
 * Loja externa genérica sobre `localStorage`, no formato que o
 * `useSyncExternalStore` espera. Só roda no navegador; cai para memória
 * quando o `localStorage` falha (navegação privada, cota cheia) — a loja
 * continua funcionando, só não sobrevive a um recarregamento. Reage a
 * mudanças feitas em outras abas (evento `storage`) e nesta mesma aba (evento
 * customizado disparado a cada escrita).
 *
 * `quote/store.ts` e `planner/plan-store.ts` (Task 9) são wrappers finos por
 * cima desta loja, cada um com sua própria chave e seu próprio parser.
 */

export type LocalStore<T> = {
  /** Snapshot estável: mesma referência enquanto o texto salvo não muda. */
  get(): T;
  set(value: T): void;
  subscribe(listener: () => void): () => void;
  /** Só para testes: zera o estado do módulo. */
  reset(): void;
};

export function createLocalStore<T>(options: {
  key: string;
  parse: (raw: string | null) => T;
  empty: T;
}): LocalStore<T> {
  const { key, parse, empty } = options;
  const changeEvent = `franccino:local-store:${key}`;

  /** Definido quando o localStorage falha: o valor vive só na página. */
  let memoryRaw: string | null | undefined;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = empty;

  function readRaw(): string | null {
    if (memoryRaw !== undefined) {
      return memoryRaw;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      memoryRaw = null;
      return null;
    }
  }

  function get(): T {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
    return cachedValue;
  }

  function set(value: T): void {
    const raw = JSON.stringify(value);
    if (memoryRaw === undefined) {
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        memoryRaw = raw;
      }
    } else {
      memoryRaw = raw;
    }
    window.dispatchEvent(new Event(changeEvent));
  }

  function subscribe(listener: () => void): () => void {
    const onStorage = (event: Event) => {
      const storageKey = (event as StorageEvent).key;
      if (storageKey === null || storageKey === undefined || storageKey === key) {
        listener();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(changeEvent, listener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(changeEvent, listener);
    };
  }

  function reset(): void {
    memoryRaw = undefined;
    cachedRaw = undefined;
    cachedValue = empty;
  }

  return { get, set, subscribe, reset };
}
