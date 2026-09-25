'use client';

/**
 * Renders a Cloudflare Turnstile widget, loading the script on demand (only
 * when a form that needs it mounts). The widget itself creates the hidden
 * `cf-turnstile-response` input inside the container div — `ContactForm`/
 * `NewsletterForm` read it from the submitted `FormData`, no extra wiring
 * needed here.
 *
 * Exposes an imperative `reset()` (via `ref`) so the owning form can request
 * a fresh token after each submit attempt — a Turnstile token is single-use,
 * so without this a second submission (after a validation error, or a second
 * successful send) would fail with a stale/already-used token.
 */

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
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
    script.addEventListener('error', () => {
      // Clear the cache on failure so a later mount (e.g. after the visitor
      // comes back online) retries loading instead of reusing a promise
      // that's permanently rejected.
      scriptPromise = null;
      reject(new Error('Failed to load Turnstile.'));
    });
    document.head.append(script);
  });

  return scriptPromise;
}

type TurnstileProps = {
  siteKey: string;
};

export type TurnstileHandle = {
  /** Discards the current (possibly already-used) token and issues a new challenge. */
  reset: () => void;
};

export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile({ siteKey }, ref) {
  const t = useTranslations('forms');
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedIdRef = useRef<string | undefined>(undefined);
  const widgetId = useId();

  useEffect(() => {
    let cancelled = false;

    void loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      renderedIdRef.current = window.turnstile.render(containerRef.current, { sitekey: siteKey });
    });

    return () => {
      cancelled = true;
      if (renderedIdRef.current && window.turnstile) {
        window.turnstile.remove(renderedIdRef.current);
      }
      renderedIdRef.current = undefined;
    };
  }, [siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (renderedIdRef.current && window.turnstile) {
          window.turnstile.reset(renderedIdRef.current);
        }
      },
    }),
    [],
  );

  return <div ref={containerRef} id={widgetId} aria-label={t('turnstileLabel')} />;
});
