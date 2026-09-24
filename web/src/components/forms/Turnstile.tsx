'use client';

/**
 * Renders a Cloudflare Turnstile widget, loading the script on demand (only
 * when a form that needs it mounts). The widget itself creates the hidden
 * `cf-turnstile-response` input inside the container div — `ContactForm`/
 * `NewsletterForm` read it from the submitted `FormData`, no extra wiring
 * needed here.
 */

import { useEffect, useId, useRef } from 'react';
import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load Turnstile.')));
    document.head.append(script);
  });

  return scriptPromise;
}

type TurnstileProps = {
  siteKey: string;
};

export function Turnstile({ siteKey }: TurnstileProps) {
  const t = useTranslations('forms');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useId();

  useEffect(() => {
    let cancelled = false;
    let renderedId: string | undefined;

    void loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      renderedId = window.turnstile.render(containerRef.current, { sitekey: siteKey });
    });

    return () => {
      cancelled = true;
      if (renderedId && window.turnstile) {
        window.turnstile.remove(renderedId);
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} id={widgetId} aria-label={t('turnstileLabel')} />;
}
