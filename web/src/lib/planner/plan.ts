import { z } from 'zod';
import type { QuoteItemInput } from '@/lib/quote/types';
import { centerPlacement, countByProduct, nextUid } from './geometry';
import {
  DEFAULT_ROOM,
  MAX_PIECES,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  type PlacedPiece,
  type Plan,
  type PlannerProduct,
  type Room,
} from './types';

/** Sala vazia: não inventamos composição (conflito C17). */
export const EMPTY_PLAN: Plan = { room: DEFAULT_ROOM, pieces: [], products: {} };

export function addPiece(plan: Plan, product: PlannerProduct): Plan {
  if (plan.pieces.length >= MAX_PIECES) {
    return plan;
  }
  const { x, y } = centerPlacement(plan.room, product);
  return {
    ...plan,
    products: { ...plan.products, [String(product.id)]: product },
    pieces: [...plan.pieces, { uid: nextUid(plan.pieces), productId: product.id, x, y, r: 0 }],
  };
}

export function updatePiece(
  plan: Plan,
  uid: number,
  patch: Partial<Pick<PlacedPiece, 'x' | 'y' | 'r'>>,
): Plan {
  return {
    ...plan,
    pieces: plan.pieces.map((piece) => (piece.uid === uid ? { ...piece, ...patch } : piece)),
  };
}

export function removePiece(plan: Plan, uid: number): Plan {
  const pieces = plan.pieces.filter((piece) => piece.uid !== uid);
  const used = new Set(pieces.map((piece) => String(piece.productId)));
  const products = Object.fromEntries(Object.entries(plan.products).filter(([id]) => used.has(id)));
  return { ...plan, pieces, products };
}

export function setRoom(plan: Plan, room: Room): Plan {
  return { ...plan, room };
}

export type PlanEntry = { piece: PlacedPiece; product: PlannerProduct };

export function planEntries(plan: Plan): PlanEntry[] {
  return plan.pieces.flatMap((piece) => {
    const product = plan.products[String(piece.productId)];
    return product ? [{ piece, product }] : [];
  });
}

/** Uma linha por peça, com a quantidade na sala e a medida do ambiente como observação. */
export function planToQuoteInputs(plan: Plan, note: string): QuoteItemInput[] {
  return countByProduct(plan.pieces).flatMap(({ productId, count }) => {
    const product = plan.products[String(productId)];
    return product
      ? [
          {
            productId: product.id,
            slug: product.slug,
            locale: product.locale,
            name: product.name,
            image: product.image,
            finishes: [],
            quantity: count,
            note,
          },
        ]
      : [];
  });
}

const productSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  locale: z.enum(['pt', 'en']),
  name: z.string().min(1),
  category: z.string(),
  width: z.number().positive(),
  depth: z.number().positive(),
  shape: z.enum(['rect', 'round']),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
});

const planSchema = z.object({
  room: z.object({
    w: z.number().min(ROOM_MIN_CM).max(ROOM_MAX_CM),
    d: z.number().min(ROOM_MIN_CM).max(ROOM_MAX_CM),
  }),
  pieces: z
    .array(
      z.object({
        uid: z.number().int().positive(),
        productId: z.number().int().positive(),
        x: z.number(),
        y: z.number(),
        r: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
      }),
    )
    .max(MAX_PIECES),
  products: z.record(z.string(), productSchema),
});

export function parsePlan(raw: string | null): Plan {
  if (!raw) {
    return EMPTY_PLAN;
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_PLAN;
  }
  const parsed = planSchema.safeParse(data);
  if (!parsed.success) {
    return EMPTY_PLAN;
  }
  const plan = parsed.data;
  return { ...plan, pieces: plan.pieces.filter((piece) => plan.products[String(piece.productId)]) };
}
