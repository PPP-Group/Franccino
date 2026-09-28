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
