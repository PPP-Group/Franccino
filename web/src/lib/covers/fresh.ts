import { getQuoteItems, quoteActions } from '@/lib/quote/store';
import { recentStore, refreshRecentCovers } from '@/lib/recent/store';
import { currentCovers } from './actions';

/** Uma conferência por visita a cada tanto: "Peças que você viu" aparece em quase toda página. */
const RECENT_EVERY_MS = 10 * 60 * 1000;
let recentCheckedAt = 0;

/** Lista de desejos com as capas atuais do catálogo (ao abrir a página da lista). */
export async function refreshQuoteCovers(): Promise<void> {
  const items = getQuoteItems();
  if (items.length === 0) return;
  try {
    quoteActions.refreshImages(await currentCovers(items.map(({ slug, locale }) => ({ slug, locale }))));
  } catch {
    // Sem rede: a lista fica com as miniaturas guardadas.
  }
}

/** "Peças que você viu" com as capas atuais do catálogo, no máximo uma vez a cada 10 minutos. */
export async function refreshRecentProductCovers(): Promise<void> {
  const list = recentStore.get();
  if (list.length === 0 || Date.now() - recentCheckedAt < RECENT_EVERY_MS) return;
  recentCheckedAt = Date.now();
  try {
    const covers = await currentCovers(
      list.map((item) => ({ slug: item.slug, locale: item.locale ?? 'pt' })),
    );
    const current = recentStore.get();
    const next = refreshRecentCovers(current, covers);
    if (next !== current) recentStore.set(next);
  } catch {
    // Sem rede: ficam as capas guardadas.
  }
}
