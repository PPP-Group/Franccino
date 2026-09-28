import { describe, expect, it, vi } from 'vitest';
import type { PlannerProduct } from '@/lib/planner/types';
import { renderWithIntl } from '@/test/intl';
import { RoomPlanner } from './RoomPlanner';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/lib/planner/actions', () => ({ searchPlannerPieces: vi.fn(async () => []) }));

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};

describe('RoomPlanner', () => {
  it('starts with an empty 5 × 4 m room and the catalogue pieces', () => {
    const html = renderWithIntl(<RoomPlanner initialLibrary={[sofa]} />);
    expect(html).toContain('value="5.0"');
    expect(html).toContain('value="4.0"');
    expect(html).toContain('aria-label="Pôr Sofá Majestic na sala"');
    expect(html).toContain('240 × 100 cm');
    expect(html).toContain('Nenhuma peça ainda.');
    expect(html).toContain('role="group"');
  });

  it('keeps rotate and remove disabled without a selected piece', () => {
    const html = renderWithIntl(<RoomPlanner initialLibrary={[]} />);
    expect(html.match(/<button type="button" disabled="">/g)).toHaveLength(2);
  });
});
