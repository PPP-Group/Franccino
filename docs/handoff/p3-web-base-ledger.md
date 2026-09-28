# SDD ledger — plan: docs/plans/2026-09-23-p3-web-base.md

Spec: docs/specs/2026-09-23-fundacao-design.md (+ docs/api.md)
Worktree: C:/dev/franccino/.worktrees/web (branch feature/fundacao-web, base 88998ee)
Implementer default model: sonnet. Task reviewers: sonnet. Final review: opus.

## Pre-flight scan

| Tasks           | Shared file / interface                                                   | Produces → consumes                                                     | Finding                                                                                       |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| T1 → T2, T3, T6 | env.ts (serverEnv, publicEnv)                                             | T1 `publicEnv` const parsed at import; T2 routing + T3 client import it | CONFLICT: import-time parse throws when NEXT_PUBLIC_API_URL is unset (tests, any import) → R1 |
| T2 → T5, T6     | navigation getPathname, pathnames map                                     | same internal keys                                                      | consistent                                                                                    |
| T3 → T4, T5, T6 | types (Image, Dimension, SitemapEntry, Settings, ProductDetail), CacheTag | same names                                                              | consistent                                                                                    |
| T4 → T6         | ApiImage, formatDimension, RichText                                       | consumed in pages                                                       | consistent                                                                                    |
| T5 → T6         | buildMetadata, JsonLd                                                     | consumed in pages                                                       | consistent                                                                                    |
| T1 ↔ root       | pnpm-workspace.yaml may need approved builds                              | only file T1 may touch at root                                          | consistent with constraints                                                                   |

| Task | Self-consistency                                                 | Finding                      |
| ---- | ---------------------------------------------------------------- | ---------------------------- |
| T1   | env.test imports ./env → module-level publicEnv parse            | see R1                       |
| T2   | [locale]/layout as root layout + global not-found                | follow next-intl docs → R2   |
| T3   | client tests stub env with vi.stubEnv, serverEnv() read per call | ok (serverEnv is a function) |
| T4   | revalidateTag(tag, 'max') Next 16 signature                      | ok, verify installed version |
| T5   | metadata uses SITE_ENV from serverEnv()                          | ok                           |
| T6   | LanguageSwitcher reads alternate links from head                 | ok                           |

## Rulings

- Ruling (R1, T1/T2/T3): nothing parses env at import time. `env.ts` exports `serverEnv()` (as planned), a memoized `getPublicEnv()` instead of a `publicEnv` const, and `getSiteLocales()` that parses only `NEXT_PUBLIC_SITE_LOCALES` (default `pt,en`) for the routing config; `NEXT_PUBLIC_*` still read by literal name inside those functions so Next inlines them. `vitest.config.mts` sets `test.env` defaults (`API_URL`, `SITE_URL`, `NEXT_PUBLIC_API_URL`). Plan names `publicEnv` in later tasks map to `getPublicEnv()` — why: an import-time parse crashes tests and any page when an unrelated variable is missing — cost if wrong: small rename.
- Ruling (R2, T2): root layout structure follows the installed next-intl docs for `[locale]` routing (a passthrough `app/layout.tsx` if required for the global `not-found`) — why: Next requires a root layout for app-level not-found — cost if wrong: none.

## Progress

Task 1: dispatched (BASE 88998ee, implementer sonnet, agent a38bfb4f56fb887a5)
Task 1: implementer DONE_WITH_CONCERNS (commit 599ab7c; trailer says Sonnet 5, AGENTS.md kept separate, web/.gitignore removed, allowBuilds moved to root); review dispatched (sonnet, filtered package excludes pnpm-lock.yaml)
Task 1: review → Spec ✅, quality Approved.
Task 1: minor (deferred): eslint globalIgnores lacks coverage/**; getPublicEnv() memoization untested; env.test uses vi.stubEnv without unstubAllEnvs; commit trailer says Sonnet 5 (accurate for executing model — accepted); web/CLAUDE.md references AGENTS.md instead of inlining.
Task 1: complete (commits 88998ee..599ab7c, review clean)
Task 2: dispatched (BASE 599ab7c, implementer sonnet, agent a2db9d2ce15b9ea02)
Note: impeccable hook flagged overused font (create-next-app default Geist/Arial) in web/src/app/globals.css:25 — scaffold default, intentionally left: P3 has no visual design; P4 replaces typography with the approved direction's faces. Not suppressed.
Task 2: implementer hit API rate limit before any commit; resumed same agent at 19:10
Task 2: implementer DONE_WITH_CONCERNS (commit 21489f3; typecheck runs next typegen; placeholder copy in messages); review dispatched (sonnet)
Task 2: review → Spec ✅, quality Approved.
Task 2: minor (deferred): web/CLAUDE.md documents typecheck as `tsc --noEmit` (actual: `next typegen && tsc --noEmit`); global not-found bare shell for non-JS on excluded invalid-locale paths; placeholder copy in messages nav/footer/forms/products needs copy pass.
Task 2: complete (commits 599ab7c..21489f3, review clean)
Task 3: dispatched (BASE 21489f3, implementer sonnet, agent a4b580470d00e8ede)
Task 3: implementer DONE (commit 9e5ccaf; Settings/Block types best-effort from prose); review dispatched
Task 3: review → Spec ✅, quality Approved with 1 Important (forms.ts → client.ts → serverEnv coupling into client bundle).
Task 3: minor (deferred): Banner.image/Client url+logo nullability assumed silently; getSitemap tagged with all CacheTags; ContactPayload optional fields not flagged.
Task 3: fix round 1/5 dispatched (resume implementer: move ApiError to neutral module)
Task 3: fix round 1/5 implementer hit rate limit mid-edit (uncommitted errors.ts/client.ts/forms.ts); resumed same agent 2026-09-24
Task 3: fix round 1/5 implementer done (commit ea0226a); scoped re-review dispatched (haiku)
Task 3: fix round 1/5 (1 addressed, 0 open; commits 9e5ccaf..ea0226a)
Task 3: complete (commits 21489f3..ea0226a, review clean)
Task 4: dispatched (BASE ea0226a, implementer sonnet, agent afeadc89f7c03e61e)
Task 4: implementer DONE_WITH_CONCERNS (commit 147007d; dimension abbreviations kept as DEFAULT_DIMENSION_LABELS in dimensions.ts, messages dimensions namespace mismatch flagged); review dispatched (sonnet)
Task 4: review → Spec ✅, quality Needs fixes (Important: revalidate secret non-constant-time compare; basic-auth.ts has safeEqual).
Task 4: fix round 1/5 dispatched (resume implementer; also malformed-body test, width+diameter case, ApiImage null-dimension branch)
Task 4: fix round 1/5 implementer done (commit a5cb1d0); scoped re-review dispatched (haiku)
Task 4: fix round 1/5 (4 addressed, 0 open; commits 147007d..a5cb1d0)
Task 4: minor (deferred): messages dimensions namespace (full words) vs DEFAULT_DIMENSION_LABELS abbreviations — reconcile when a page first renders dimensions; safeEqual early-returns on length mismatch (leaks length only, same as basic auth).
Task 4: complete (commits ea0226a..a5cb1d0, review clean)
Task 5: dispatched (BASE a5cb1d0, implementer sonnet, agent aba67c9f9cefb088d)
Task 5: implementer DONE_WITH_CONCERNS (commit 5219adb; SitemapEntry.key optional; build fallback bypassed when a live API returns 404; productJsonLd brand = Franccino); review dispatched (sonnet)
Ruling (R3, P3 T5 / P2 T11): sitemap entries carry optional `key` (area key for type category, page key for type page) — P2 T11 SitemapTest already specifies it; P2 T11 implementer must document `key` in docs/api.md `GET /sitemap` row — why: contract row omitted a field both plans rely on — cost if wrong: one doc line.
Task 5: review → Spec ❌ (page sitemap entries routed by slugs instead of key — R3 postdated the dispatch), quality Needs fixes.
Task 5: fix round 1/5 dispatched (resume implementer: page key routing, SitemapEntry.key string, drop unknown category key)
Task 5: fix round 1/5 implementer done (commit eb77e4b); scoped re-review dispatched (haiku)
Task 5: fix round 1/5 (2 addressed, 0 open; commits 5219adb..eb77e4b)
Task 5: minor (deferred): productJsonLd brand fixed to Franccino; build fallback only for unreachable API (live API returning 404 fails the build — revisit when API endpoints exist); resolveHref double fallback.
Task 5: complete (commits a5cb1d0..eb77e4b, review clean)
Task 6: dispatched (BASE eb77e4b, implementer sonnet, agent a9c2e94b4ad7fce10; carries T4 dimensions-labels reconciliation)
Task 6: implementer hit rate limit before any change; resumed same agent
Task 6: implementer DONE_WITH_CONCERNS (commit 600e142; catalog/content fallbacks; Blocks shapes best-effort; filters sort+page only; real-API check deferred); review dispatched (sonnet)
Task 6: review → Spec ✅, quality Approved.
Task 6: minor (deferred to final fix dispatch): search/stores/downloads/projects pages type searchParams as string (repeated key -> array -> .trim() 500); category area not cross-checked (API lacks area filter); ProductGrid pagination uses <a>.
Task 6: complete (commits eb77e4b..600e142, review clean)
All tasks complete; final whole-branch review dispatched (opus, 88998ee..600e142)
Final review → With fixes (1 Critical: empty optional env values crash serverEnv/getPublicEnv; Important: cache tags miss embedded resources, category hreflang alternates missing, searchParams arrays + 422 as 500, forms hang on network error + Turnstile not reset, LanguageSwitcher stale on same-template navigation, sitemap drops pages with null slugs, Settings/Blocks shape mismatch vs P2, page intro rendered as raw HTML, user queries cached/rate-limit bypass).
Ruling (R4, final): canonical Block schema (aligned with P2 plan T8/T11 LocalizedBlocks): rich_text {body html}; image {image url string, caption}; image_text {body html, image url string, caption?}; gallery {images: url string[]}; timeline {items[{year, title, text}]}; faq {items[{question, answer}]}; stats {items[{value, label}]}; quote {text, author}; cta {title, text, label, url}. Web aligns now; P2 T8 (Pages builder field names) and T11 (docs/api.md) carry the same schema — why: contract only said "Block[]"; the API plan fixes rich_text/image/timeline shapes — cost if wrong: field renames on one side.
Ruling (R5, final): page `intro` is plain text (data-model json tr, not RichText) — render as text — cost if wrong: switch to RichText once the API sanitizes and documents it.
Ruling (R6, final): Settings shape reconciled in P4 Task 4; for now footer/jsonld guard missing fields so the real /settings response cannot crash the layout.
Ruling (R7, final): rate limiting for search/listing is a deploy concern (CDN/proxy) — recorded for runbook; in code, requests with `q` use no data cache.
Final fix dispatch (single) — fresh implementer (sonnet)
Ruling (R4 corrected): Block schema = docs/data-model.md pages.content table (image_text: image, heading, body html, image_position; cta: heading, body, label, url; gallery: images[], caption; others as table). Sent to final fix implementer.
Final fix: implementer hit rate limit after tests passed (uncommitted); resumed same agent
Final fix: done (commits aadf6ff, edc91c8, ffe6b91, ff86662; 114 tests); scoped re-review dispatched (sonnet)
Final fix re-review: 10 addressed, item 6 partial (LanguageSwitcher href always locale home + unconditional preventDefault → modifier-click/copy-link regression). Residual fix sent to same implementer.
Ruling (R8, final): global-error.tsx keeps hardcoded bilingual pt/en strings with a file-scoped eslint override — no locale/provider above [locale]/layout; list as an explicit exception for tech lead in the PR — cost if wrong: small refactor.
Final fix residual: LanguageSwitcher fixed (commit 7e4c9b3; real href, refresh on nav + pre-interaction, no preventDefault) — controller-verified diff.
Minor (deferred to P4 Task 4, which rewrites the switcher): useState initializer reads document on client while dynamic SSR renders /{locale} → possible hydration mismatch on dynamic pages; initialize with fallback and resolve in effect.
P3 COMPLETE: feature/fundacao-web 88998ee..7e4c9b3, 114 tests, final review addressed.
