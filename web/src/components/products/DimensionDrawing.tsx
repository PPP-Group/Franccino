import type { DrawingGeometry } from '@/lib/product/dimension-drawing';

const TICK = 5;

type DimLineProps = { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean };

function DimLine({ x1, y1, x2, y2, label, vertical = false }: DimLineProps) {
  return (
    <g>
      <line className="dim-line" x1={x1} y1={y1} x2={x2} y2={y2} />
      <line
        className="dim-line"
        x1={vertical ? x1 - TICK : x1}
        y1={vertical ? y1 : y1 - TICK}
        x2={vertical ? x1 + TICK : x1}
        y2={vertical ? y1 : y1 + TICK}
      />
      <line
        className="dim-line"
        x1={vertical ? x2 - TICK : x2}
        y1={vertical ? y2 : y2 - TICK}
        x2={vertical ? x2 + TICK : x2}
        y2={vertical ? y2 : y2 + TICK}
      />
      {vertical ? (
        <text
          x={x1 - 10}
          y={(y1 + y2) / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${x1 - 10} ${(y1 + y2) / 2})`}
        >
          {label}
        </text>
      ) : (
        <text x={(x1 + x2) / 2} y={y1 - 9} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export type DimensionDrawingLabels = {
  title: string;
  front: string;
  side: string;
  width: string;
  depth: string | null;
  height: string;
  seat: string | null;
};

/** Vista frontal (L × A) e lateral (P × A) na mesma escala; textos já formatados pelo chamador. */
export function DimensionDrawing({
  geometry,
  labels,
}: {
  geometry: DrawingGeometry;
  labels: DimensionDrawingLabels;
}) {
  const { front, side, baseY, seatY } = geometry;
  return (
    <svg viewBox={`0 0 ${geometry.viewWidth} ${geometry.viewHeight}`} role="img" aria-label={labels.title}>
      <rect className="dim-shape" x={front.x} y={front.y} width={front.width} height={front.height} />
      {seatY !== null ? (
        <line className="dim-seat" x1={front.x} y1={seatY} x2={front.x + front.width} y2={seatY} />
      ) : null}
      <DimLine
        x1={front.x}
        y1={front.y - 16}
        x2={front.x + front.width}
        y2={front.y - 16}
        label={labels.width}
      />
      <DimLine x1={front.x - 16} y1={front.y} x2={front.x - 16} y2={baseY} label={labels.height} vertical />
      {side ? (
        <g>
          <rect className="dim-shape" x={side.x} y={side.y} width={side.width} height={side.height} />
          {labels.depth ? (
            <DimLine
              x1={side.x}
              y1={side.y - 16}
              x2={side.x + side.width}
              y2={side.y - 16}
              label={labels.depth}
            />
          ) : null}
          {seatY !== null ? (
            <line className="dim-seat" x1={side.x} y1={seatY} x2={side.x + side.width} y2={seatY} />
          ) : null}
          {seatY !== null && labels.seat ? (
            <text x={side.x + side.width + 6} y={seatY + 4} textAnchor="start">
              {labels.seat}
            </text>
          ) : null}
          <text x={side.x + side.width / 2} y={baseY + 20} textAnchor="middle">
            {labels.side}
          </text>
        </g>
      ) : null}
      <line className="dim-ground" x1={front.x - 20} y1={baseY} x2={geometry.viewWidth - 24} y2={baseY} />
      <text x={front.x + front.width / 2} y={baseY + 20} textAnchor="middle">
        {labels.front}
      </text>
    </svg>
  );
}
