import {
  FINE_STEP_CM,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  SNAP_CM,
  type Box,
  type PlacedPiece,
  type PlannerProduct,
  type Room,
  type Rotation,
} from './types';

type Size = Pick<PlannerProduct, 'width' | 'depth'>;

/** Caixa ocupada (cm) depois de girar 0/90/180/270°. */
export function footprint(product: Size, r: Rotation): { w: number; d: number } {
  const turned = r % 180 !== 0;
  return { w: turned ? product.depth : product.width, d: turned ? product.width : product.depth };
}

export function pieceBox(piece: PlacedPiece, product: Size): Box {
  const { w, d } = footprint(product, piece.r);
  return { uid: piece.uid, x: piece.x, y: piece.y, w, d };
}

/** Centro de giro que mantém a caixa girada em [0, w'] × [0, d'] (mesma conta do protótipo). */
export function rotationPivot(product: Size, r: Rotation): [number, number] {
  const { width: w, depth: d } = product;
  if (r === 90) {
    return [d / 2, d / 2];
  }
  if (r === 270) {
    return [w / 2, w / 2];
  }
  return [w / 2, d / 2];
}

export function findConflicts(room: Room, boxes: Box[]): Set<number> {
  const conflicts = new Set<number>();
  boxes.forEach((a, i) => {
    if (a.x < 0 || a.y < 0 || a.x + a.w > room.w || a.y + a.d > room.d) {
      conflicts.add(a.uid);
    }
    for (const b of boxes.slice(i + 1)) {
      if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y) {
        conflicts.add(a.uid);
        conflicts.add(b.uid);
      }
    }
  });
  return conflicts;
}

/** Percentual do piso ocupado (arredondado). */
export function floorUsage(room: Room, boxes: Box[]): number {
  const used = boxes.reduce((sum, box) => sum + box.w * box.d, 0);
  return Math.round((used / (room.w * room.d)) * 100);
}

export function snap(value: number, step: number = SNAP_CM): number {
  return Math.round(value / step) * step;
}

/** Lê metros ("5,2" ou "5.2") e devolve cm dentro dos limites; inválido → `fallbackCm`. */
export function roomSizeFromMeters(input: string, fallbackCm: number): number {
  const value = Number(input.trim().replace(',', '.'));
  if (!input.trim() || !Number.isFinite(value) || value <= 0) {
    return fallbackCm;
  }
  return Math.round(Math.min(ROOM_MAX_CM, Math.max(ROOM_MIN_CM, value * 100)));
}

export function rotateQuarter(r: Rotation): Rotation {
  return ((r + 90) % 360) as Rotation;
}

/** Setas movem 5 cm; com Shift, 1 cm. */
export function keyboardDelta(key: string, fine: boolean): [number, number] | null {
  const step = fine ? FINE_STEP_CM : SNAP_CM;
  switch (key) {
    case 'ArrowLeft':
      return [-step, 0];
    case 'ArrowRight':
      return [step, 0];
    case 'ArrowUp':
      return [0, -step];
    case 'ArrowDown':
      return [0, step];
    default:
      return null;
  }
}

export function centerPlacement(room: Room, product: Size): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round((room.w - product.width) / 2)),
    y: Math.max(0, Math.round((room.d - product.depth) / 2)),
  };
}

export function nextUid(pieces: Pick<PlacedPiece, 'uid'>[]): number {
  return pieces.reduce((max, piece) => Math.max(max, piece.uid), 0) + 1;
}

export function countByProduct(
  pieces: Pick<PlacedPiece, 'productId'>[],
): { productId: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const piece of pieces) {
    counts.set(piece.productId, (counts.get(piece.productId) ?? 0) + 1);
  }
  return [...counts].map(([productId, count]) => ({ productId, count }));
}
