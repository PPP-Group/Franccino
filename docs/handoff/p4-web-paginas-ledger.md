# SDD ledger — plan: docs/plans/2026-09-24-p4-web-paginas.md

Spec: docs/specs/2026-09-23-fundacao-design.md (binding). Worktree: .worktrees/web (branch feature/fundacao-web), base 7e4c9b3 (P3 complete).

## Pre-flight

Scan table and drift analysis: preflight.md (this directory), done by an opus scan agent against P3 HEAD 7e4c9b3 because P4 predates the P3 final fixes.

## Rulings

All proposed rulings R1–R16 in preflight.md §5 are adopted verbatim as binding (controller decision 2026-09-25): R1 LanguageSwitcher keeps 7e4c9b3 mechanics (restyle only; init state with /{locale}); R2 forms keep P3 try/catch/finally + Turnstile siteKey/ref reset, add .field .error style; R3 no withBuildFallback — use apiGet fallback, shared lib/api/empty.ts; R4 adopt P4 Settings type, getSettings normalizes, P4 does not edit docs/api.md (P2 R10 documents it); R5 alternateHrefs everywhere; R6 area/category description plain text; R7 merge messages, catalog.empty stays string (new catalog.emptyState), keep stores/forms; R8 T6 updates DownloadButton callers; R9 append to existing tests; R10 dimension labels from messages + single formatCentimeters; R11 generic createLocalStore; R12 drop invented copy (madeToOrder, "feitas sob medida", "e a loja mais próxima"); R13 P2 T12 prerequisite only for manual Mailpit checks (T3 step 5, T12 step 5.5); R14 layout-level skip link #conteudo; R15 protected P3 names list extended, htmlLang(locale) instead of ternaries; R16 runbook note for planner Server Action rate limit.

## Progress

Task 1: dispatched (BASE 7e4c9b3, implementer sonnet, agent a87dfebdfc846ed60; R7/R9/R15 carried)
Task 1: implementer DONE (commit 6928813; 118 tests); review dispatched (sonnet)
Task 1: review → Spec ✅, quality Approved.
Task 1: minor (deferred): report self-review undercounted ink-2 conversions (no code defect); AppHref duplicates P3 Href.
Task 1: complete (commits 7e4c9b3..6928813, review clean)
Task 2: dispatched (BASE 6928813, implementer sonnet, agent a730a6919d2f50b35; R9/R11/R13/R15 carried)
Task 2: implementer DONE (commit 43d44c6; 146 tests; local-store.ts per R11); review dispatched (sonnet)
Task 2: review → Spec ✅, quality Approved.
Task 2: minor (deferred): local-store set() dispatchEvent unguarded without window; permanent memory fallback after one storage failure; no window-undefined test.
Task 2: complete (commits 6928813..43d44c6, review clean)
Task 3: dispatched (BASE 43d44c6, implementer sonnet, agent a37f394adc4598d05; R2/R7/R9/R13/R15 carried)
Task 3: implementer DONE (commit d6e0c0b; 157 tests; Mailpit check pending per R13); review dispatched (sonnet)
Task 3: review → Spec ✅, quality Approved.
Task 3: minor (deferred): .pair class styling to confirm (components.css); type field error fallback not in alert chain; no re-entrancy guard on Enter while sending (pre-existing).
Task 3: complete (commits 43d44c6..d6e0c0b, review clean)
Task 4: dispatched (BASE d6e0c0b, implementer sonnet, agent a08b0cd42c9a7e982; R1/R3/R4/R7/R9/R14/R15 carried)
Task 4: implementer DONE (commit cda376d; 166 tests; manual visual check not run); review dispatched (sonnet)
Task 4: review → Spec ✅, quality Needs fixes (Important plan-mandated: Escape handler on nav sibling never fires after toggle open).
Task 4: fix round 1/5 dispatched (resume implementer: document Escape + focus return, focus into menu, body scroll lock, footer aria-labelledby)
Integration: develop worktree .worktrees/develop merges feature/fundacao-{projeto,api,web}; pushed to franccino/develop d870347 (2026-09-26, user-authorized). Smoke: admin 200; site 500 until API T10/T11 public endpoints land (expected).
Task 4: fix round 1/5 (4 addressed, 0 open; commits cda376d..c0b70af; controller-verified diff)
Task 4: minor (deferred): no interactive tests (no DOM env; manual browser check pending for final QA T12); scroll lock stays if menu open then resized to desktop.
Task 4: complete (commits d6e0c0b..c0b70af, review clean)
Task 5: dispatched (BASE c0b70af, implementer sonnet, agent a06564b6f88f24e81; R7/R9/R12/R15 carried)
Task 5: implementer DONE (commit ec16ea0; 170 tests; listing pagination dropped until T6 as ruled); review dispatched (sonnet)
Task 5: review → Spec ✅, quality Needs fixes (plan-mandated: quick-add 38px target < 44, border contrast 1.4:1).
Task 5: fix round 1/5 dispatched (resume implementer: 44px, --line-field, added-state aria-label)
Task 5: fix round 1/5 (3 addressed, 0 open; commits ec16ea0..82fc87e; controller-verified diff)
Task 5: minor (deferred): table/button quick-add variants untested until consumers exist; post-click aria-label untested (no DOM env).
Task 5: complete (commits c0b70af..82fc87e, review clean)
Task 6: dispatched (BASE 82fc87e, implementer sonnet, agent a677482ab9b0aeec2; R3/R5/R6/R7/R8/R9/R10/R12/R15 carried)
Task 6: implementer DONE (commits 3f308fa, e07870b, ca31ce5; 181 tests; touch targets 33-38px flagged; view.test R15 deviation; 422→empty added); review dispatched (sonnet)
Ruling (R17, T6+): touch targets — primary standalone controls (view toggle, filter submit, pagination, download buttons) >= 44px tall; inline chips/breadcrumbs keep Task 1 precedent — why: constraints name 44px, AA only needs 24px — cost if wrong: small CSS.
Task 6: review → Spec ✅ except R17 touch targets, quality Needs fixes (view toggle, file-link, filter submit, pagination links <44px; .download CSS missing).
Task 6: fix round 1/5 dispatched (resume implementer)
Task 6: fix round 1 agent stalled (watchdog) with no changes; controller applied the CSS-only fix directly (commit e5d2a43): 44px targets for view toggle, btn--compact, file-link, pagination link hit area; .download card style. 181 tests, lint, build green.
Task 6: complete (commits 82fc87e..e5d2a43)
Task 7: dispatched (BASE e5d2a43, implementer sonnet, agent ad31441ba31a94412; C2 stronger test, single roving handler, R17, R7/R9/R12/R15)
Task 7: implementer DONE (commit 4917c3a; 191 tests); review dispatched (sonnet)
Task 7: review → Spec ✅ (one R17 literal deviation), quality Needs fixes only on that point.
Ruling (R18, T7): R17 requires control borders >= 3:1; var(--ink) on the stepper exceeds it — accepted as compliant (--line-field is the floor, not a mandate) — cost if wrong: none.
Task 7: minor (deferred): single-group FinishSelector branch untested; possible double announcement (aria-live swatch-name + aria-checked).
Task 7: complete (commits e5d2a43..4917c3a, review clean with R18)
Task 8: dispatched (BASE 4917c3a, implementer sonnet, agent ae731c812e29337ca; R3/R5/R7/R9/R10/R12/R15/R17 + roving reuse)
Ruling (R19, from P2 T11 review): web Banner type — title (and subtitle/cta fields) nullable per data-model/api.md; Task 11 (Home) must type and render banners null-safely (no invented fallback copy).
Integration 2: develop 5cbaf8a = API through T11 (8dae9b7) + web through P4 T7 (4917c3a); pushed. Smoke: all main routes 200 with empty DB (/pt, /en, /pt/produtos, ?view=table, /pt/indoor, /pt/lancamentos, /pt/lojas, /pt/contato).
Task 8: implementer DONE (commits e50aa2d, 7de8f52; 203 tests); review dispatched (sonnet)
Task 8: review → Spec ✅ except R17, quality Needs fixes: (Important) .thumbs button < 44px at 320-390px (product.css:107-119, ProductStage.tsx:54); (Important, plan-mandated) ModelViewer lacks single-step retry after 3D load error (useEffect [] deps); (Minor) .tabs button < 44px. Fix round 1 NOT yet done.
Handoff 2026-09-28: execution paused; see docs/HANDOFF.md.
Resumed 2026-09-28 (new executor, clone C:/dev/franccino, branch feature/fundacao-web fast-forwarded to develop e370fb3).
Task 8: fix round 1/5 (3 addressed, 0 open; commits 7de8f52..e4bbcac; 205 tests, lint, typecheck, build green; controller-verified diff): .thumbs button min-height 44px + 4 columns ≤560px (measured 46px at 320, 59px at 390); .tabs button min-height 44px; ModelViewer "Tentar de novo" (attempt state, effect deps [attempt], `key` remount).
Ruling (R20, T8): the retry must also change the GLB URL (`modelSourceForAttempt` adds `retry=N` from the second attempt) — `@google/model-viewer` caches each load by URL, failures included (CachingGLTFLoader.preload), so a plain remount would reuse the failure — cost if wrong: one query param on public media.
Task 8: finding (outside T8): media CORS. model-viewer fetches the GLB cross-origin; `/storage` on localhost:8000 (and the R2 media bucket later) sends no Access-Control-Allow-Origin, and api/config/cors.php covers only `api/*` — so the 3D fails locally even with a valid GLB. Documented in docs/runbook-deploy.md (deploy note + go-live checklist); local dev fix (serve media with CORS) is a tech-lead decision, not done.
Task 8: manual browser check (Chrome headless, local QA product later removed): 320/390/1440 px sizes above; 3D error → alert with button → click remounts `<model-viewer>` and refetches the GLB; no page errors besides the CORS failure.
Task 8: minor (deferred): retry path has no automated test (no DOM env); success after retry not observable locally until media CORS exists.
Task 8: complete (commits 4917c3a..e4bbcac, review clean) — next: T9.
Scope note (2026-09-28): the user confirmed to follow the plan order T9 → T12; per A1 the scope additions (room planner, quote list, finishes, technical view, 3D) need tech-lead approval before release, not before implementation. Work now in worktree .worktrees/web (main checkout stays on feature/fundacao-api to run the API with the P2 T14 demo data).
Task 9: implemented inline (BASE 7b3e509, commit ac4dc75; 222 tests, lint, typecheck, build green). Code as in the plan; `planner/plan-store.ts` is a thin wrapper over `createLocalStore` (R11) keeping the plan's exported names.
Ruling (R21, T9): planner.css applies R17 to the planner's primary controls (`.piece-option button` 34 → 44px, `.canvas-bar button` min-height 44px) and maps the prototype's `var(--ok)` (no such token) to `var(--garden)`, as T7 did — cost if wrong: small CSS.
Task 9: review (controller inline) → Spec ✅ (R11, R21), quality Approved.
Task 9: complete (commits 7b3e509..ac4dc75, review clean) — next: T10.
Task 10: implemented inline (BASE cd71f48, commit 677b258; 226 tests, lint, typecheck, build green). Code as in the plan except the page: loaders called directly, no `withBuildFallback` (R3), and no `alternates` (R5); `planner` messages appended textually (existing keys untouched); runbook rate-limit bullet for the planner Server Action POST (R16).
Task 10: manual browser check (Chrome headless, API with the P2 T14 demo data): library 13 pieces with footprint; 3 pieces → overlap warning; mouse drag and touch drag (390px, hasTouch) move the piece; keyboard only (focus piece, arrows, Shift+arrows, R, Delete → focus back on the canvas) with live announcement; room 3,2 × 2,8 (comma accepted) → "3,20 por 2,80 metros"; reload keeps the plan; "Enviar sala para a lista" → header Lista 0 → 2 with toast; Server Action search "sofá" returns sofas; no page errors.
Task 10: review (controller inline) → Spec ✅ (R3, R5, R16), quality Approved.
Task 10: minor (deferred): the route builds as dynamic (ƒ), not static with revalidation — same for every top-level `[locale]` page (cause predates T10), for the final review; drag and keyboard have no automated test (no DOM env).
Task 10: complete (commits cd71f48..677b258, review clean) — next: T11.
Task 10: fix round 1/5 (controller, found while preparing T11): R15 — `PlannerLibrary`/`RoomPlanner` kept the plan's `locale === 'pt' ? 'pt-BR' : 'en'` ternary; now `htmlLang(locale)` (commit 8b515a1; planner tests and typecheck green).
Task 11: implemented inline (BASE 8b515a1, commit d919d9a; 230 tests, lint, typecheck, build green). Code as in the plan with the preflight rulings: fetchers called directly, no `withBuildFallback` (R3); no `alternates` (R5); `area.description` as `<p className="lead">`, not `RichText` (R6); `stores` merged keeping `allStates`/`empty`, `home` appended, existing keys untouched (R7); `FeatureSection` passes `dimensions` labels to `formatDimension` (R10); `PlannerTeaser` uses `htmlLang(locale)` (R15); web `Banner` type now nullable in every field, `image` included, as in docs/api.md — the hero uses the plain plate when `image` is null and `title ?? fallbackTitle` keeps the h1, with an added test for an all-null banner (R19).
Ruling (R22, T11): `.line-panel` gets `background: var(--ink)` — the area cover is optional (`Image | null`), and without it the white copy sat on the light page ground (under 2:1 at the top line); the photo covers the ground when present, as `.hero`/`.designer__photo` grounds do in the prototype — cost if wrong: one CSS line.
Task 11: finding (T6 defect, fixed in de9d98c): `.table-scroll` was not a containing block, so the `.visually-hidden` spans in the table header (position: absolute) escaped the horizontal scroll and widened the page to 820px at 390px (home and /produtos?view=table); `position: relative` on `.table-scroll` fixes both.
Task 11: manual browser check (Chrome headless). Without API (build and `next start` with ALLOW_BUILD_WITHOUT_API=true and an unreachable API_URL): /pt and /en render only the plain hero and the room teaser. With the API (P2 T14 demo data): /pt and /en at 1440 and 390 px render the 9 sections in prototype order (hero with photo banner and null title → fallbackTitle, launches rail, lines, feature, teaser, designers, factory, technical table, stores); state chips switch stores (DF 1 → SP 6) by mouse and touch; no horizontal overflow; no page errors. Banners unpublished through the model → RevalidateFrontend ran → plain hero from the second request on (revalidateTag 'max' serves stale once, by design); banners restored.
Task 11: review (controller inline) → Spec ✅ (R3, R5, R6, R7, R10, R15, R19, R22), quality Approved.
Task 11: minor (deferred): `pages.home` and `sections` messages lost their last reference with the old home (T12 cleanup per R7); P2 T14 demo data has no area covers and the `factory` page has no cover/intro, so those parts render text only locally.
Finding (environment, Windows): root `pnpm dev` runs `queue:listen --tries=1`; on Windows an idle `queue:work --once` child sometimes exceeds the listener's 60 s timeout (ProcessTimedOutException, twice on 2026-09-28) and `concurrently -k` then stops the API and the site too. Local workaround used: `queue:listen --tries=1 --timeout=0`. Changing the root script is a tech-lead decision, not done.
Task 11: complete (commits 8b515a1..d919d9a, review clean) — next: T12.
Task 12: implemented inline (BASE 9c9ac4a, commit 1637c81; 231 tests, lint, typecheck, build green with and without API). Code as in the plan with the preflight rulings: the page calls `getSettings` directly (R3) and passes no `alternates` (R5); T12 keys merged into the existing `quote` namespace, existing keys untouched (R7); `quote.intro` without "e a loja mais próxima" / "and the nearest store" (R12); R7 cleanup: 26 keys with zero references (grep, both locales) removed — `pages.home` (old home) and P3 leftovers in `common`, `nav`, `footer`, `forms`, `products`, `catalog`; `sections.*` and `products.download` kept (still referenced); web/CLAUDE.md folder map and the browser-state rule.
Ruling (R23, T12): R17 applied to the quote item "Remover" button (`min-height: 44px`, measured 44px; stepper 48px, form buttons 50px), as R21 did for the planner — cost if wrong: small CSS.
Ruling (R24, T12 final check): root `app/not-found.tsx` now uses `defaultLocale` explicitly (commit ec5766a). Its `getLocale()` read `headers()` (no `setRequestLocale` above the root), and Next renders that boundary in the tree of every route, so every `[locale]` page had been dynamic (ƒ) since P3 — the T10 minor. Found with a temporary `dynamic = 'error'` on /terms ("used `headers()`") and by neutralizing the locale and root not-found in turn (only the root one mattered). After the fix the static routes prerender (s-maxage 3600) and only routes reading `searchParams` stay ƒ; in `next start` with the API: static pages served from cache, POST /api/revalidate (banners, home) refreshes /pt from the second request, unknown product and route answer 404 (the product 404 carries the `products` tag). A no-API build had also made `products/[slug]` a zero-path SSG route that answered 500 (DYNAMIC_SERVER_USAGE) at runtime; gone with the fix. The global 404 is now always in Portuguese — cost if wrong: one line.
Task 12: Step 5 final verification. Gates: lint, typecheck, 231 tests, build without API and with API green. Rule greps: 1 and 4 empty; 2 and 3 only match header comments documenting the substitutions (as forms/planner/product.css already did); `border-radius` only `.list-count`, `.area-dot` and a `0` reset on fields.
Task 12: Step 5 browser (Chrome headless, 375 and 1440 px, API with P2 T14 demo data): (1) /pt and /en 9 sections; Tab from the top: skip link → logo → nav → search → language → list (375: skip link, logo, search, list, menu button); (2) /pt/produtos, ?view=table, /pt/indoor, a category, /en/novelties and a launch: 200, no overflow, no errors; (3) product: finish by keyboard (arrow moves and checks, name announced) with a temporary QA finish group removed afterwards, 2 units, WhatsApp text with quantity and finish, quick add; download and 3D not exercised — the demo data has no files or GLB, and 3D is blocked locally by media CORS (T8 finding); (4) room planner as in T10; (5) quote list: +1, remove → focus on the h1 and toast, WhatsApp list link, send → POST /contact 201 with `items`, "Pedido enviado", list and header count empty; no mail is queued locally because `contact_recipients` is empty (by design), and Mailpit is unavailable (no Docker), so the ContactMessageReceived mailable was rendered for the stored message: subject "[Site] Nova mensagem: Orçamento — …", item with quantity and finish; the QA messages were deleted afterwards; (7) reduced motion: hero plate animation none, counter 1 ms.
Task 12: Step 5 item 6: Lighthouse is not installed here (not downloaded without approval). Approximation with applied throttling (150 ms RTT, 1.6 Mbps, CPU 4x, PerformanceObserver) on `next start` after R24: LCP /pt 3.3-4.8 s (LCP = hero image; page weight JS 260 KB, font 89 KB, images 93 KB), product page 1.6-2.5 s, CLS 0 on both. Applied throttling is harsher than Lighthouse's simulated mode and the machine was also running the API and the dev server, so the official Lighthouse numbers for the PR are still to be taken.
Task 12: review (controller inline) → Spec ✅ (R3, R5, R7, R12, R23, R24), quality Approved.
Task 12: minor (deferred): quote list CLS ≈ 0.3 when the busy placeholder (plan-mandated, avoids flashing "empty") is swapped for the list or the empty state; global 404 in Portuguese only.
Task 12: complete (commits 9c9ac4a..1637c81, review clean) — next: final P4 branch review.
Final review (controller inline, 7e4c9b3..10884e4): branch-wide checks clean — no `withBuildFallback`, no `alternates` literals, no locale ternaries, no `RichText` on plain-text descriptions, no TODO/console; the 4 `eslint-disable` lines are justified in place. Plan-wide gates as in T12 Step 5.
Final review: fix round 1/1 (3 addressed): (1) R24 root not-found (ec5766a, found in T12 Step 5); (2) T4 deferred minor made real — with the menu open at ≤1180 px, crossing to desktop width (tablet rotation, resize) hid the toggle and left the page scroll-locked; the menu now closes on the media query change (10884e4), checked 1024 → 1366 → 1024 px plus Esc; (3) `.table-scroll` overflow (de9d98c, found in T11). Deferred minors re-checked: T3 Enter while sending is not reachable (the disabled submit blocks implicit submission); T2 local-store guards only matter off the browser (client-only callers); quote-list CLS and the Portuguese-only global 404 stay for the tech lead.
Final review: merge check — feature/fundacao-web and feature/fundacao-api are 0 commits behind origin/develop and merge without conflicts, alone and together.
P4: complete (7e4c9b3..10884e4) — next: PR feature/fundacao-web → develop (tech-lead approval); the P5 items are listed at the end of the plan.
