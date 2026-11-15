import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { DownloadLeadDialog } from './DownloadLeadDialog';

describe('DownloadLeadDialog', () => {
  it('has a close button at the top, besides the "Cancelar" at the end of the form', () => {
    const html = renderWithIntl(<DownloadLeadDialog onDone={() => undefined} onClose={() => undefined} />);
    const close = html.indexOf('class="lead-dialog__close"');
    expect(close).toBeGreaterThan(-1);
    expect(html).toContain('aria-label="Fechar"');
    // Antes do formulário: fica no topo da janela, sem rolar até o fim.
    expect(close).toBeLessThan(html.indexOf('<form'));
  });
});
