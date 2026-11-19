import type { Store } from '@/lib/api/types';

/** Uma loja no botão de WhatsApp: o número já no formato do wa.me (com o 55). */
export type WhatsappStore = { id: number; name: string; number: string };
export type WhatsappCity = { key: string; city: string; state: string; stores: WhatsappStore[] };

/** Só os dígitos, com o 55 do Brasil quando o número vem só com DDD. */
function international(digits: string): string {
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

/**
 * Número de WhatsApp da loja: o cadastrado em WhatsApp ou, sem ele, o telefone quando é celular (DDD + 9 + 8 dígitos).
 * Telefone fixo não entra: a pessoa cairia num número que não atende WhatsApp.
 */
export function storeWhatsapp(store: Pick<Store, 'whatsapp' | 'phone'>): string | null {
  const whatsapp = (store.whatsapp ?? '').replace(/\D/g, '');
  if (whatsapp.length >= 10) return international(whatsapp);
  const phone = (store.phone ?? '').replace(/\D/g, '').replace(/^55(?=\d{11}$)/, '');
  if (phone.length === 11 && phone[2] === '9') return international(phone);
  return null;
}

/**
 * Cidades do botão de WhatsApp (revisão da Franccino, 18/11/2026: "um chatbot básico de escolha de cidade que leva a
 * um WhatsApp de alguma loja nossa"), em ordem alfabética, cada uma com as lojas que têm número. Lojas exclusivas
 * antes das revendas, dentro da cidade.
 */
export function whatsappCities(stores: Store[]): WhatsappCity[] {
  const byCity = new Map<string, WhatsappCity>();
  const sorted = [...stores].sort((a, b) => Number(a.type !== 'exclusive') - Number(b.type !== 'exclusive'));
  for (const store of sorted) {
    const number = storeWhatsapp(store);
    if (!number) continue;
    const key = `${store.city}-${store.state}`;
    const city = byCity.get(key) ?? { key, city: store.city, state: store.state, stores: [] };
    city.stores.push({ id: store.id, name: store.name, number });
    byCity.set(key, city);
  }
  return [...byCity.values()].sort((a, b) => a.city.localeCompare(b.city, 'pt', { sensitivity: 'base' }));
}
