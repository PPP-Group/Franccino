/**
 * Escolha do aviso de cookies (LGPD), guardada no navegador por `createLocalStore` (R11 do P4). O
 * registro com valor de prova fica na API (`POST /consents`); aqui só o necessário para não perguntar
 * de novo e saber se o Tag Manager pode carregar.
 */
import { createLocalStore } from '@/lib/ui/local-store';

export type ConsentChoice = 'granted' | 'denied';

/** Categorias opcionais (os cookies necessários não dependem de escolha). */
export type ConsentCategories = { analytics: boolean; marketing: boolean };

/**
 * Versão da política de cookies em vigor. Mudou o texto da política: mude a data e todos são perguntados de novo.
 * 12/11/2026: a política ganhou texto e o aviso passou a ter categorias (análise e marketing).
 */
export const COOKIE_POLICY_VERSION = '2026-11-12';

export const CONSENT_STORAGE_KEY = 'franccino.consent.v1';

export type StoredConsent = {
  choice: ConsentChoice;
  visitorId: string;
  version: string;
  categories: ConsentCategories;
};

function categoriesOf(value: unknown, choice: ConsentChoice): ConsentCategories {
  if (typeof value === 'object' && value !== null && 'analytics' in value && 'marketing' in value) {
    return { analytics: value.analytics === true, marketing: value.marketing === true };
  }
  return { analytics: choice === 'granted', marketing: choice === 'granted' };
}

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
      const categories = categoriesOf('categories' in value ? value.categories : null, value.choice);
      return { choice: value.choice, visitorId: value.visitorId, version: value.version, categories };
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

/** O que a pessoa liberou; `null` antes da escolha. */
export function getConsentCategories(): ConsentCategories | null {
  return store.get()?.categories ?? null;
}

/**
 * Grava a escolha e devolve o id do visitante (o mesmo de antes, se já havia um) para o registro na API. Sem
 * categorias, "aceitar" libera todas e "recusar" nenhuma; `choice` é `granted` quando alguma foi liberada.
 */
export function setConsent(
  choice: ConsentChoice,
  newId: () => string = () => crypto.randomUUID(),
  categories?: ConsentCategories,
): string {
  const visitorId = store.get()?.visitorId ?? newId();
  const chosen = categories ?? { analytics: choice === 'granted', marketing: choice === 'granted' };
  const finalChoice: ConsentChoice = chosen.analytics || chosen.marketing ? 'granted' : 'denied';
  store.set({ choice: finalChoice, visitorId, version: COOKIE_POLICY_VERSION, categories: chosen });
  return visitorId;
}

/** Abre o aviso de novo (link "Preferências de cookies" do rodapé). */
export const CONSENT_OPEN_EVENT = 'franccino:consent-open';

export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function subscribeConsent(listener: () => void): () => void {
  return store.subscribe(listener);
}

/** Só para testes: zera o estado do módulo. */
export function resetConsentStoreForTests(): void {
  store.reset();
}
