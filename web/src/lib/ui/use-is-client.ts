import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` no servidor e durante a hidratação; `true` depois, sem efeito nem re-render extra. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
