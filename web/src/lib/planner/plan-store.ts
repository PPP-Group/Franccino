/**
 * Loja externa da planta (localStorage) para `useSyncExternalStore`. Só no
 * navegador. Wrapper fino sobre `createLocalStore` (`lib/ui/local-store.ts`,
 * R11), com os nomes do plano.
 */
import { createLocalStore } from '@/lib/ui/local-store';
import { EMPTY_PLAN, parsePlan } from './plan';
import { PLAN_STORAGE_KEY, type Plan } from './types';

const store = createLocalStore<Plan>({ key: PLAN_STORAGE_KEY, parse: parsePlan, empty: EMPTY_PLAN });

/** Snapshot estável: mesma referência enquanto o texto salvo não muda. */
export function getPlan(): Plan {
  return store.get();
}

export function getServerPlan(): Plan {
  return EMPTY_PLAN;
}

export function savePlan(plan: Plan): void {
  store.set(plan);
}

export function subscribePlan(listener: () => void): () => void {
  return store.subscribe(listener);
}

/** Só para testes. */
export function resetPlanStoreForTests(): void {
  store.reset();
}
