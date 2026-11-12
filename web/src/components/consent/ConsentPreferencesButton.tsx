'use client';

import { openConsentPreferences } from '@/lib/consent/store';

/** "Preferências de cookies" no rodapé: reabre o aviso com as categorias para mudar a escolha. */
export function ConsentPreferencesButton({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-button" onClick={openConsentPreferences}>
      {label}
    </button>
  );
}
