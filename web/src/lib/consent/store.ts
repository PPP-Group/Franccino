/**
 * Escolha do aviso de cookies (LGPD), guardada no navegador por `createLocalStore` (R11 do P4). O
 * registro com valor de prova fica na API (`POST /consents`); aqui só o necessário para não perguntar
 * de novo e saber se o Tag Manager pode carregar.
 */
import { createLocalStore } from '@/lib/ui/local-store';

export type ConsentChoice = 'granted' | 'denied';

/** Versão da política de cookies em vigor. Mudou o texto da política: mude a data e todos são perguntados de novo. */
export const COOKIE_POLICY_VERSION = '2026-10-01';

export const CONSENT_STORAGE_KEY = 'franccino.consent.v1';

export type StoredConsent = { choice: ConsentChoice; visitorId: string; version: string };

export function parseStoredConsent(raw: string | null): StoredConsent | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'choice' in value &&
      (value.choice === 'granted' || value.choice === 'denied') &&
      'visitorId' in value &&
      typeof value.visitorId === 'string' &&
      'version' in value &&
      value.version === COOKIE_POLICY_VERSION
    ) {
      return { choice: value.choice, visitorId: value.visitorId, version: value.version };
    }
  } catch {
    // texto inválido = sem escolha
  }
  return null;
}

const store = createLocalStore<StoredConsent | null>({
  key: CONSENT_STORAGE_KEY,
  parse: parseStoredConsent,
  empty: null,
});

export function getConsent(): ConsentChoice | null {
  return store.get()?.choice ?? null;
}

export function getServerConsent(): ConsentChoice | null {
  return null;
}

/** Grava a escolha e devolve o id do visitante (o mesmo de antes, se já havia um) para o registro na API. */
export function setConsent(choice: ConsentChoice, newId: () => string = () => crypto.randomUUID()): string {
  const visitorId = store.get()?.visitorId ?? newId();
  store.set({ choice, visitorId, version: COOKIE_POLICY_VERSION });
  return visitorId;
}

export function subscribeConsent(listener: () => void): () => void {
  return store.subscribe(listener);
}

/** Só para testes: zera o estado do módulo. */
export function resetConsentStoreForTests(): void {
  store.reset();
}
