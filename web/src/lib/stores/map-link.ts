import type { Store } from '@/lib/api/types';

type MapTarget = Pick<Store, 'name' | 'address' | 'city' | 'state' | 'country' | 'latitude' | 'longitude'>;

/** Link de busca do Google Maps (sem chave nem embed, B2): coordenadas se houver as duas, senão o endereço. */
export function mapSearchUrl(store: MapTarget): string {
  const query =
    store.latitude !== null && store.longitude !== null
      ? `${store.latitude},${store.longitude}`
      : [store.name, store.address, store.city, store.state, store.country].join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
