/** Google Tag Manager carregado só depois do "Aceitar" do aviso de cookies (P5b T7, E6). */

export function gtmScriptSrc(id: string): string {
  return `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
}

type GtmWindow = Window & { dataLayer?: unknown[] };

/** `gtag(...)` do Google: o Tag Manager só lê comandos (`consent`, `config`) empilhados como `arguments`. */
export function gtag(win: GtmWindow, ...args: unknown[]): void {
  const dataLayer = (win.dataLayer = win.dataLayer ?? []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- só declara a assinatura; o valor vem de `arguments`
  function push(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params -- o formato que o Tag Manager espera é o objeto `arguments`
    dataLayer.push(arguments);
  }
  push(...args);
}

/**
 * Consent Mode do Google com tudo negado por padrão, antes do Tag Manager: é o que a AdOpt pede quando o banner dela
 * roda pelo Tag Manager. A escolha do visitante chega depois, pela própria AdOpt (`consent update`).
 */
export function denyConsentByDefault(win: GtmWindow = window): void {
  gtag(win, 'consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });
}

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
