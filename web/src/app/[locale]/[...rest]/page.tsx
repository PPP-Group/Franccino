import { notFound } from 'next/navigation';

/**
 * Any path under `/pt` or `/en` that no route matches. Without this, Next renders the global `app/not-found.tsx`
 * (no header, footer or styles); calling `notFound()` here shows `[locale]/not-found.tsx` inside the layout.
 */
export default function CatchAllNotFound() {
  notFound();
}
