import type { Store } from '@/lib/api/types';

type MapTarget = Pick<Store, 'name' | 'address' | 'city' | 'state'>;

/**
 * Link de busca do Google Maps (sem chave nem embed, B2) pelo nome e endereço da loja. Com as coordenadas, o Maps abria
 * só um pino de latitude e longitude, sem a ficha da loja (revisão geral de 14/11/2026, item 09); pelo nome e endereço
 * ele abre a ficha do Google quando a loja tem uma, e o endereço quando não tem.
 */
export function mapSearchUrl(store: MapTarget): string {
  const query = [store.name, store.address, store.city, store.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
