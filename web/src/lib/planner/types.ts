import type { Locale } from '@/i18n/config';
import type { QuoteImage } from '@/lib/quote/types';

export const PLAN_STORAGE_KEY = 'franccino.plan.v1';
export const ROOM_MIN_CM = 150;
export const ROOM_MAX_CM = 2000;
export const SNAP_CM = 5;
export const FINE_STEP_CM = 1;
export const MAX_PIECES = 60;
export const CIRCULATION_WARNING_PERCENT = 45;

export type PieceShape = 'rect' | 'round';
export type Rotation = 0 | 90 | 180 | 270;

/** Peça do catálogo com a medida principal em centímetros (retrato salvo com a planta). */
export type PlannerProduct = {
  id: number;
  slug: string;
  locale: Locale;
  name: string;
  category: string;
  width: number;
  depth: number;
  shape: PieceShape;
  image: QuoteImage | null;
};

/** Posição do canto superior esquerdo da caixa ocupada, em cm. */
export type PlacedPiece = { uid: number; productId: number; x: number; y: number; r: Rotation };
export type Room = { w: number; d: number };
export type Plan = { room: Room; pieces: PlacedPiece[]; products: Record<string, PlannerProduct> };
export type Box = { uid: number; x: number; y: number; w: number; d: number };

export const DEFAULT_ROOM: Room = { w: 500, d: 400 };
