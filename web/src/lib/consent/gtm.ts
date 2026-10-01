/** Google Tag Manager carregado só depois do "Aceitar" do aviso de cookies (P5b T7, E6). */

export function gtmScriptSrc(id: string): string {
  return `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
}

type GtmWindow = Window & { dataLayer?: unknown[] };

/** Idempotente: injeta o script uma vez e inicializa o `dataLayer`. */
export function loadGtm(id: string, doc: Document = document, win: GtmWindow = window): void {
  const src = gtmScriptSrc(id);
  if (doc.querySelector(`script[src="${src}"]`)) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = doc.createElement('script');
  script.async = true;
  script.src = src;
  doc.head.appendChild(script);
}
