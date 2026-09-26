import type { AreaRef } from '@/lib/api/types';
import { areaTone } from '@/lib/catalog/area';

export function AreaDot({ area }: { area: AreaRef['key'] }) {
  return <span className={`area-dot area-dot--${areaTone(area)}`} aria-hidden="true" />;
}
