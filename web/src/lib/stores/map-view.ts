/**
 * Conta do mapa das lojas (ajustes do cliente, 06/10/2026): projeção Web Mercator, o zoom que cabe todas
 * as lojas no quadro e os ladrilhos (tiles) que cobrem o quadro. Sem biblioteca de mapa: o componente
 * só posiciona as imagens dos ladrilhos e os pinos.
 */

export const TILE_SIZE = 256;

/**
 * Ladrilhos do OpenStreetMap (exigem a atribuição visível). Para trocar por um provedor pago, basta
 * mudar este endereço.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const MIN_ZOOM = 3;
const MAX_ZOOM = 13;

export type MapPoint = { latitude: number; longitude: number };
export type MapTile = { key: string; src: string; left: number; top: number };
export type MapView = {
  zoom: number;
  /** Canto superior esquerdo do quadro, em pixels do mundo no `zoom`. */
  originX: number;
  originY: number;
  tiles: MapTile[];
};

/** Posição de um ponto em pixels do mundo no zoom dado. */
export function project({ latitude, longitude }: MapPoint, zoom: number): { x: number; y: number } {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((Math.max(-85, Math.min(85, latitude)) * Math.PI) / 180);
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

/** Maior zoom em que todos os pontos cabem no quadro com a folga (`padding`) dada. */
export function fitZoom(points: MapPoint[], width: number, height: number, padding: number): number {
  for (let zoom = MAX_ZOOM; zoom > MIN_ZOOM; zoom -= 1) {
    const projected = points.map((point) => project(point, zoom));
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    if (spanX <= width - 2 * padding && spanY <= height - 2 * padding) {
      return zoom;
    }
  }
  return MIN_ZOOM;
}

/** Quadro centrado nos pontos, no maior zoom que cabe todos, com os ladrilhos que o cobrem. */
export function mapView(points: MapPoint[], width: number, height: number, padding = 32): MapView | null {
  if (points.length === 0 || width <= 0 || height <= 0) {
    return null;
  }
  const zoom = fitZoom(points, width, height, padding);
  const projected = points.map((point) => project(point, zoom));
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const originX = Math.round(centerX - width / 2);
  const originY = Math.round(centerY - height / 2);

  const count = 2 ** zoom;
  const tiles: MapTile[] = [];
  for (let ty = Math.floor(originY / TILE_SIZE); ty <= Math.floor((originY + height) / TILE_SIZE); ty += 1) {
    if (ty < 0 || ty >= count) {
      continue;
    }
    for (let tx = Math.floor(originX / TILE_SIZE); tx <= Math.floor((originX + width) / TILE_SIZE); tx += 1) {
      const wrapped = ((tx % count) + count) % count;
      tiles.push({
        key: `${zoom}-${tx}-${ty}`,
        src: TILE_URL.replace('{z}', String(zoom)).replace('{x}', String(wrapped)).replace('{y}', String(ty)),
        left: tx * TILE_SIZE - originX,
        top: ty * TILE_SIZE - originY,
      });
    }
  }
  return { zoom, originX, originY, tiles };
}
