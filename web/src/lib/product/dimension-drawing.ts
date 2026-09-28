/**
 * Geometria pura do desenho técnico de medidas (vista frontal + lateral, mesma
 * escala do protótipo aprovado). `DimensionDrawing` (Task 8) só desenha o SVG
 * a partir do que esta função calcula.
 */

import type { Dimension } from '@/lib/api/types';

/** px por mm: mesma escala do protótipo (o SVG se ajusta ao container). */
export const DRAWING_SCALE = 0.16;
const PAD = 44;
const GAP = 60;
const BASE_EXTRA = 10;

export type DrawingRect = { x: number; y: number; width: number; height: number };

export type DrawingGeometry = {
  viewWidth: number;
  viewHeight: number;
  round: boolean;
  front: DrawingRect;
  side: DrawingRect | null;
  baseY: number;
  seatY: number | null;
  widthMm: number;
  /** `null` em peças redondas (a lateral mostra o diâmetro, sem cota própria). */
  depthMm: number | null;
  heightMm: number;
  seatMm: number | null;
};

export function computeDrawing(dimension: Dimension): DrawingGeometry | null {
  const round = dimension.diameter !== null && dimension.width === null;
  const widthMm = dimension.width ?? dimension.diameter;
  const heightMm = dimension.height;
  if (widthMm === null || heightMm === null) {
    return null;
  }
  const sideMm = round ? dimension.diameter : dimension.depth;
  const w = widthMm * DRAWING_SCALE;
  const h = heightMm * DRAWING_SCALE;
  const front: DrawingRect = { x: PAD, y: PAD, width: w, height: h };
  const side: DrawingRect | null =
    sideMm !== null ? { x: PAD + w + GAP, y: PAD, width: sideMm * DRAWING_SCALE, height: h } : null;
  const baseY = PAD + h;
  const seatMm = dimension.seat_height;
  return {
    viewWidth: PAD * 2 + w + (side ? GAP + side.width : 0),
    viewHeight: PAD * 2 + h + BASE_EXTRA,
    round,
    front,
    side,
    baseY,
    seatY: seatMm !== null ? baseY - seatMm * DRAWING_SCALE : null,
    widthMm,
    depthMm: round ? null : dimension.depth,
    heightMm,
    seatMm,
  };
}
