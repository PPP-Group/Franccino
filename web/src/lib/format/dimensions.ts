/**
 * Formats a `Dimension` (see `docs/api.md`, values in millimeters) into the
 * compact display string used across product pages, e.g. `L 60 × P 60 × A 75
 * cm` (pt) or `W 60 × D 60 × H 75 cm` (en).
 *
 * The letter labels default to the pt/en map below so this stays pure and
 * testable without next-intl. A page that wants the labels to live in
 * `messages/*.json` can fetch them (e.g. via `getTranslations('dimensions')`)
 * and pass them through the optional `labels` parameter instead.
 */

import type { Locale } from '@/i18n/config';
import type { Dimension } from '@/lib/api/types';

export type DimensionLabels = {
  width: string;
  depth: string;
  height: string;
  seatHeight: string;
  diameter: string;
};

export const DEFAULT_DIMENSION_LABELS: Record<Locale, DimensionLabels> = {
  pt: { width: 'L', depth: 'P', height: 'A', seatHeight: 'Assento', diameter: 'Ø' },
  en: { width: 'W', depth: 'D', height: 'H', seatHeight: 'Seat', diameter: 'Ø' },
};

const DECIMAL_SEPARATOR: Record<Locale, string> = { pt: ',', en: '.' };

/** mm → cm, up to one decimal, using the locale's decimal separator. */
function formatMillimeters(mm: number, locale: Locale): string {
  const [wholePart, decimalPart] = (mm / 10).toFixed(1).split('.');

  if (decimalPart === '0') {
    return wholePart!;
  }

  return `${wholePart}${DECIMAL_SEPARATOR[locale]}${decimalPart}`;
}

export function formatDimension(
  dimension: Dimension,
  locale: Locale,
  labels: DimensionLabels = DEFAULT_DIMENSION_LABELS[locale],
): string {
  const { width, depth, height, seat_height: seatHeight, diameter } = dimension;

  const mainParts: string[] = [];
  if (diameter !== null) {
    mainParts.push(`${labels.diameter} ${formatMillimeters(diameter, locale)}`);
  }
  if (width !== null) {
    mainParts.push(`${labels.width} ${formatMillimeters(width, locale)}`);
  }
  if (depth !== null) {
    mainParts.push(`${labels.depth} ${formatMillimeters(depth, locale)}`);
  }
  if (height !== null) {
    mainParts.push(`${labels.height} ${formatMillimeters(height, locale)}`);
  }

  const segments: string[] = [];
  if (mainParts.length > 0) {
    segments.push(`${mainParts.join(' × ')} cm`);
  }
  if (seatHeight !== null) {
    segments.push(`${labels.seatHeight} ${formatMillimeters(seatHeight, locale)} cm`);
  }

  return segments.join(' · ');
}
