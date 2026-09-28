import type { Ref, SVGProps } from 'react';
import { footprint, rotationPivot } from '@/lib/planner/geometry';
import type { PlanEntry } from '@/lib/planner/plan';
import type { Room } from '@/lib/planner/types';

const MARGIN = 60;
const GRID_CM = 50;
const LABEL_MIN_CM = 70;

export type PlanSvgProps = {
  room: Room;
  pieces: PlanEntry[];
  selectedUid?: number | null;
  conflicts?: ReadonlySet<number>;
  /** Nome acessível da planta (texto já traduzido). */
  label: string;
  widthLabel: string;
  depthLabel: string;
  /** Nome e medida escritos dentro de peças grandes. */
  pieceText?: (entry: PlanEntry) => { name: string; size: string };
  /** Só na sala interativa: foco, teclado e arrastar. Sem isso, a planta é uma imagem. */
  pieceProps?: (entry: PlanEntry) => SVGProps<SVGGElement>;
  svgRef?: Ref<SVGSVGElement>;
};

function gridLines(length: number): number[] {
  const lines: number[] = [];
  for (let value = GRID_CM; value < length; value += GRID_CM) {
    lines.push(value);
  }
  return lines;
}

/** Planta em escala (1 unidade = 1 cm), compartilhada pela sala e pelo teaser da home. */
export function PlanSvg({
  room,
  pieces,
  selectedUid = null,
  conflicts,
  label,
  widthLabel,
  depthLabel,
  pieceText,
  pieceProps,
  svgRef,
}: PlanSvgProps) {
  return (
    <svg
      ref={svgRef}
      className="plan-svg"
      viewBox={`${-MARGIN} ${-MARGIN} ${room.w + 2 * MARGIN} ${room.d + 2 * MARGIN}`}
      role={pieceProps ? 'group' : 'img'}
      aria-label={label}
    >
      <rect className="plan-floor" x={0} y={0} width={room.w} height={room.d} />
      {gridLines(room.w).map((x) => (
        <line
          key={`x${x}`}
          className={x % 100 === 0 ? 'plan-grid plan-grid--major' : 'plan-grid'}
          x1={x}
          y1={0}
          x2={x}
          y2={room.d}
        />
      ))}
      {gridLines(room.d).map((y) => (
        <line
          key={`y${y}`}
          className={y % 100 === 0 ? 'plan-grid plan-grid--major' : 'plan-grid'}
          x1={0}
          y1={y}
          x2={room.w}
          y2={y}
        />
      ))}
      <g className="plan-measure" aria-hidden="true">
        <line x1={0} y1={-26} x2={room.w} y2={-26} />
        <line x1={0} y1={-32} x2={0} y2={-20} />
        <line x1={room.w} y1={-32} x2={room.w} y2={-20} />
        <text x={room.w / 2} y={-34} textAnchor="middle">
          {widthLabel}
        </text>
        <line x1={-26} y1={0} x2={-26} y2={room.d} />
        <line x1={-32} y1={0} x2={-20} y2={0} />
        <line x1={-32} y1={room.d} x2={-20} y2={room.d} />
        <text x={-34} y={room.d / 2} textAnchor="middle" transform={`rotate(-90 -34 ${room.d / 2})`}>
          {depthLabel}
        </text>
      </g>
      {pieces.map((entry) => {
        const { piece, product } = entry;
        const box = footprint(product, piece.r);
        const [px, py] = rotationPivot(product, piece.r);
        const text = pieceText?.(entry);
        const className = [
          'piece',
          piece.uid === selectedUid ? 'is-selected' : '',
          conflicts?.has(piece.uid) ? 'is-conflict' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <g
            key={piece.uid}
            className={className}
            transform={`translate(${piece.x} ${piece.y})`}
            {...pieceProps?.(entry)}
          >
            <g transform={`rotate(${piece.r} ${px} ${py})`}>
              {product.shape === 'round' ? (
                <ellipse
                  cx={product.width / 2}
                  cy={product.depth / 2}
                  rx={product.width / 2}
                  ry={product.depth / 2}
                />
              ) : (
                <rect width={product.width} height={product.depth} rx={2} />
              )}
            </g>
            {text && Math.max(box.w, box.d) > LABEL_MIN_CM ? (
              <g aria-hidden="true">
                <text x={box.w / 2} y={box.d / 2 - 2} textAnchor="middle">
                  {text.name}
                </text>
                <text className="piece__size" x={box.w / 2} y={box.d / 2 + 12} textAnchor="middle">
                  {text.size}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
