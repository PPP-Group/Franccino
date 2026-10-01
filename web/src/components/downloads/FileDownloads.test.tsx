import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { FileDownloads } from './FileDownloads';

describe('FileDownloads', () => {
  it('lists the files with a secure-link note', () => {
    const html = renderWithIntl(
      <FileDownloads
        title="Catálogos e apresentações"
        headingId="designer-downloads"
        files={[{ id: 7, type: 'catalog', title: 'Catálogo Daniela Ferro', format: 'PDF', size: 2_097_152 }]}
      />,
    );
    expect(html).toContain('id="designer-downloads"');
    expect(html).toContain('Catálogos e apresentações');
    expect(html).toContain('Catálogo Daniela Ferro');
    expect(html).toContain('Link seguro por 10 min');
  });

  it('renders nothing without files', () => {
    expect(renderWithIntl(<FileDownloads title="Downloads" files={[]} />)).toBe('');
  });
});
