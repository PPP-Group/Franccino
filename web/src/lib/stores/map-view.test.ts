import { describe, expect, it } from 'vitest';
import { fitZoom, mapView, project } from './map-view';

const saoPaulo = { latitude: -23.5704566, longitude: -46.6802991 };
const curitiba = { latitude: -25.4346206, longitude: -49.2848131 };
const brasilia = { latitude: -15.8269004, longitude: -47.953481 };

describe('map view', () => {
  it('projects the equator and greenwich to the middle of the world', () => {
    expect(project({ latitude: 0, longitude: 0 }, 0)).toEqual({ x: 128, y: 128 });
  });

  it('zooms out as the stores spread apart', () => {
    const near = fitZoom([saoPaulo, curitiba], 400, 400, 32);
    const far = fitZoom([saoPaulo, curitiba, brasilia], 400, 400, 32);
    expect(far).toBeLessThan(near);
  });

  it('keeps every store inside the frame and covers it with tiles', () => {
    const view = mapView([saoPaulo, curitiba, brasilia], 400, 480);
    expect(view).not.toBeNull();
    for (const point of [saoPaulo, curitiba, brasilia]) {
      const { x, y } = project(point, view!.zoom);
      expect(x - view!.originX).toBeGreaterThanOrEqual(0);
      expect(x - view!.originX).toBeLessThanOrEqual(400);
      expect(y - view!.originY).toBeGreaterThanOrEqual(0);
      expect(y - view!.originY).toBeLessThanOrEqual(480);
    }
    expect(view!.tiles.some((tile) => tile.left <= 0 && tile.top <= 0)).toBe(true);
    expect(view!.tiles[0].src).toMatch(/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/);
  });

  it('has nothing to show without stores or before measuring the frame', () => {
    expect(mapView([], 400, 400)).toBeNull();
    expect(mapView([saoPaulo], 0, 400)).toBeNull();
  });
});
