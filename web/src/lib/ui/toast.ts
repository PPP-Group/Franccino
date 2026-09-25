export type ToastData = { id: number; text: string; quoteLink: boolean };
type Listener = (toast: ToastData) => void;

const listeners = new Set<Listener>();
let nextId = 1;

/** Aviso curto e não bloqueante (região `role="status"` montada no layout, Task 4). */
export function showToast(input: { text: string; quoteLink?: boolean }): void {
  const toast: ToastData = { id: nextId++, text: input.text, quoteLink: input.quoteLink ?? false };
  listeners.forEach((listener) => listener(toast));
}

export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
