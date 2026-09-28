import { describe, expect, it, vi } from 'vitest';
import { onToast, showToast } from './toast';

describe('toast bus', () => {
  it('delivers toasts to listeners until they unsubscribe', () => {
    const listener = vi.fn();
    const off = onToast(listener);
    showToast({ text: 'Na lista', quoteLink: true });
    off();
    showToast({ text: 'Ignorado' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toMatchObject({ text: 'Na lista', quoteLink: true });
  });
});
