// Passthrough root layout. The real `<html>`/`<body>` markup for localized
// routes lives in `[locale]/layout.tsx` (the de-facto root layout for this
// app, as documented by next-intl for App Router setups with a `[locale]`
// segment). This file only exists because Next.js requires a root layout
// once any file sits directly in `app/` outside of `[locale]` — here, the
// global `not-found.tsx` used when `[locale]/layout.tsx` itself rejects an
// invalid locale segment and calls `notFound()`. That file provides its own
// `<html>`/`<body>` tags, since this layout intentionally does not.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
