import type { AreaRef } from '@/lib/api/types';

/** Identidade visual da área: madeira para Casa (indoor), verde para Giardini (outdoor). */
export type AreaTone = 'casa' | 'giardini';

export function areaTone(key: AreaRef['key']): AreaTone {
  return key === 'outdoor' ? 'giardini' : 'casa';
}

export function areaPath(key: AreaRef['key']): '/indoor' | '/outdoor' {
  return key === 'outdoor' ? '/outdoor' : '/indoor';
}
