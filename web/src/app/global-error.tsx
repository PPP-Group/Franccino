'use client';

/**
 * Catches errors thrown above `[locale]/layout.tsx` — including in the
 * passthrough root layout itself (`app/layout.tsx`) — where next-intl's
 * `NextIntlClientProvider` and the current locale are both unavailable (this
 * file's props carry only `error`/`reset`, no `params`). Next requires
 * `global-error.tsx` to render its own `<html>`/`<body>` and to be a Client
 * Component, since it replaces the root layout entirely.
 *
 * Because there is no reliable locale to translate for, the copy here is a
 * small static bilingual (pt/en) fallback instead of going through
 * `next-intl` — the one place in this app that isn't localized via
 * `messages/{pt,en}.json`. This should be reached rarely in practice: it
 * only fires for errors outside of `[locale]/layout.tsx` and its own
 * `error.tsx`, which handles everything else through next-intl as usual.
 */

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="pt">
      <body>
        <main id="main-content">
          <h1>
            Algo deu errado
            <br />
            Something went wrong
          </h1>
          <p>
            Não foi possível concluir esta ação. Tente novamente.
            <br />
            We couldn&apos;t complete this action. Please try again.
          </p>
          <button type="button" onClick={reset}>
            Tentar novamente / Try again
          </button>
        </main>
      </body>
    </html>
  );
}
