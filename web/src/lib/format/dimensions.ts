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

import { htmlLang, type Locale } from '@/i18n/config';
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

/**
 * mm → cm, até uma casa decimal, no separador do idioma (`Intl.NumberFormat`
 * via `htmlLang`). Formatador único de milímetro→centímetro: usado tanto pela
 * lista compacta de `formatDimension` quanto pelas medidas cheias em
 * `DimensionsBlock`/`DimensionDrawing` (Task 8). Sem agrupamento de milhar
 * (`useGrouping: false`): "1200" vira "1200", não "1.200".
 */
export function formatCentimeters(mm: number, locale: Locale): string {
  return new Intl.NumberFormat(htmlLang(locale), { maximumFractionDigits: 1, useGrouping: false }).format(
    mm / 10,
  );
}

export function formatDimension(
  dimension: Dimension,
  locale: Locale,
  labels: DimensionLabels = DEFAULT_DIMENSION_LABELS[locale],
): string {
  const { width, depth, height, seat_height: seatHeight, diameter } = dimension;

  const mainParts: string[] = [];
  if (diameter !== null) {
    mainParts.push(`${labels.diameter} ${formatCentimeters(diameter, locale)}`);
  }
  if (width !== null) {
    mainParts.push(`${labels.width} ${formatCentimeters(width, locale)}`);
  }
  if (depth !== null) {
    mainParts.push(`${labels.depth} ${formatCentimeters(depth, locale)}`);
  }
  if (height !== null) {
    mainParts.push(`${labels.height} ${formatCentimeters(height, locale)}`);
  }

  const segments: string[] = [];
  if (mainParts.length > 0) {
    segments.push(`${mainParts.join(' × ')} cm`);
  }
  if (seatHeight !== null) {
    segments.push(`${labels.seatHeight} ${formatCentimeters(seatHeight, locale)} cm`);
  }

  return segments.join(' · ');
}
