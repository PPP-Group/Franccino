# SDD ledger — plan: docs/plans/2026-09-23-p2-api.md

Spec: docs/specs/2026-09-23-fundacao-design.md (+ docs/data-model.md, docs/api.md)
Worktree: C:/dev/franccino/.worktrees/api (branch feature/fundacao-api, base 88998ee)
Implementer default model: sonnet. Task reviewers: sonnet. Final review: opus.

## Pre-flight scan

| Tasks                      | Shared file / interface                                                               | Produces → consumes                                                                              | Finding                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| T1 → T10–T12               | routes/api.php                                                                        | T1 empty file; T10/T11/T12 append groups                                                         | consistent                                                                |
| T2 → T3, T10–T13           | config/franccino.php, Locales, ContentLocale, Localized, RichText, IpHasher           | names/signatures identical across tasks                                                          | consistent                                                                |
| T3 → T5, T6, T9            | ContentPolicy, AdminOnlyPolicy, FixedRecordPolicy, InboxPolicy                        | T5/T6 register Gate::policy with these names                                                     | consistent                                                                |
| T4 → T5, T6, T10, T11      | HasImageConversions, ImagePresenter::present/presentMany                              | models use trait; resources call presenter                                                       | consistent                                                                |
| T5 → T6, T7, T10, T13, T14 | Area factory (areas.key unique)                                                       | T5 "key sequencial" + T10 helper `Area::factory()->state(['key' => 'indoor'])` repeated per call | CONFLICT: 3rd Area::factory() or 2nd helper call violates unique key → R1 |
| T5 → T6                    | Product model                                                                         | T6 adds collections/launches/projects + isNew()                                                  | consistent (sequential edit)                                              |
| T6 → T9                    | GeneralSettings (spatie/laravel-settings)                                             | T9 settings page consumes                                                                        | consistent                                                                |
| T7 → T8                    | Translatable::tabs, HydratesTranslations, CommonFields                                | T8 reuses                                                                                        | consistent                                                                |
| T7, T8, T9                 | "no create" resources                                                                 | T7 Areas expects 403, T8 Pages expects 403, T9 ContactMessages expects 404                       | INCONSISTENT expectations → R2                                            |
| T10 → T11, T12             | middleware aliases content.locale/no-store, limiters api-read/api-forms/api-downloads | same names                                                                                       | consistent                                                                |
| T11 → T12                  | DownloadController (index in T11, link in T12)                                        | sequential edit                                                                                  | consistent                                                                |
| T12 ↔ docs/api.md          | newsletter response body                                                              | T12 test expects {"data":{"subscribed":true}}, api.md silent                                     | gap → R4                                                                  |
| T13 ↔ T5 factories         | observer tags for Product::factory()                                                  | expects areas, categories, home, products                                                        | consistent with R1 (first area still created once)                        |

| Task | Self-consistency                                                                                                | Finding                   |
| ---- | --------------------------------------------------------------------------------------------------------------- | ------------------------- |
| T1   | HealthTest `/` → assertRedirect('/admin') before Filament exists                                                | ok (only checks Location) |
| T2   | Unit tests call uses(TestCase, RefreshDatabase)                                                                 | ok                        |
| T3   | inactive user → 403 via canAccessPanel                                                                          | ok                        |
| T4   | 1200px original → srcset [480, 960]; conversions always generated, presenter filters                            | ok                        |
| T5   | factories + scopes                                                                                              | see R1                    |
| T6   | settings defaults via database/settings migration                                                               | ok                        |
| T7   | Areas create 403 vs no create page                                                                              | see R2                    |
| T8   | Pages create 403                                                                                                | see R2                    |
| T9   | callTableAction may be deprecated in Filament 5                                                                 | R5                        |
| T10  | test adds media from string 'glTF' to model_3d collection that only accepts gltf-binary/octet-stream → rejected | CONFLICT → R3             |
| T11  | LocalizedBlocks fields                                                                                          | ok                        |
| T12  | DownloadLinkTest needs real local disk (Storage::fake lacks temporaryUrl)                                       | ok as written             |
| T13  | ok                                                                                                              |                           |
| T14  | counts 16 designers / 12 stores match data                                                                      | ok                        |
| T15  | boost:install may be interactive                                                                                | handled in brief          |

## Rulings

- Ruling (R1, T5/T10/T13): areas are unique by `key`. AreaFactory gets states `indoor()` and `outdoor()` (default = indoor); ProductFactory resolves `area_id` with a closure that reuses the existing indoor area (`Area::where('key','indoor')->value('id') ?? Area::factory()->indoor()->create()->id`); tests needing a specific area use a helper `area(string $key): Area` in tests/Pest.php (`Area::firstOrCreate(['key' => $key], Area::factory()->{$key}()->raw())`) instead of `Area::factory()->state([...])` — why: plan text would hit unique violations — cost if wrong: small factory refactor.
- Ruling (R2, T7/T8/T9): resources that must not create records (Areas, Pages, ContactMessages, NewsletterSubscribers, DownloadLogs) do not register a Create page and their policies deny `create`; tests assert `/create` returns 404 (not 403) — why: one consistent mechanism; 404 is what Filament returns for an unregistered page — cost if wrong: trivial test change.
- Ruling (R3, T10): the "3D disabled" test must attach a minimal binary GLB (`pack('a4VV', 'glTF', 2, 12)`), not the text 'glTF'; the `model_3d` collection accepts `model/gltf-binary` and `application/octet-stream` plus whatever finfo reports for that header — why: text content is rejected by the collection's mime filter — cost if wrong: trivial.
- Ruling (R4, T12): newsletter responses use body `{"data":{"subscribed":true}}` for both 201 and 200; T12 documents it in docs/api.md — why: api.md was silent — cost if wrong: contract doc tweak.
- Ruling (R5, T9): table-action tests may use Filament 5's `callAction(TestAction::make('markAsRead')->table($record))` if `callTableAction` is gone — why: API drift between Filament versions — cost if wrong: none.

## Progress

Task 1: dispatched (BASE 88998ee, implementer sonnet, agent ac2fab3e1b94502a4)
Task 1: implementer DONE (commit 427afc5); review dispatched (sonnet, filtered package review-t1-filtered.diff excludes composer.lock + laravel-lang files)
Task 1: review → Needs fixes (Important: composer.json php ^8.3 vs mandated ^8.4 with Pdo\Mysql 8.4-only class; api/AGENTS.md skeleton stub instructs agents to curl|bash remote installer). Minors deferred: composer name still laravel/laravel; bootstrap shouldRenderJsonWhen not reported; lang/pt_BR.json tone check later.
Task 1: fix round 1/5 dispatched (resume implementer; also delete leftover api/.npmrc)
Task 1: fix round 1/5 implementer done (commit 0cf9335: php ^8.4, AGENTS.md + .npmrc removed); scoped re-review dispatched (haiku)
Task 1: fix round 1/5 (3 addressed, 0 open; commits 427afc5..0cf9335)
Task 1: complete (commits 88998ee..0cf9335, review clean)
Task 2: dispatched (BASE 0cf9335, implementer sonnet, agent ae9cde13ac8f46383)
Task 2: implementer hit API rate limit (session limit) before any commit; resumed same agent at 19:10
Task 2: implementer DONE (commit a7e7524); review dispatched
Task 2: review → Spec ✅, quality Approved.
Task 2: minor (deferred): TranslatableAttributes interface outside file map (PHPStan shim); commit trailer says Sonnet 5.
Ruling: implementer commit trailers name the model that actually executed (Sonnet 5) instead of the plan's literal "Opus 5.5" — why: accurate attribution, harness reminder in subagents says so — cost if wrong: cosmetic trailer text.
Task 2: complete (commits 0cf9335..a7e7524, review clean)
Task 3: dispatched (BASE a7e7524, implementer sonnet, agent a1b8360bf0974b3d5)
Ruling (R6, T6/T9/T12): contact messages gain optional `items` [{product_id, quantity, finish_ids, note}] for the quote list and room planner features the user requested on 2026-09-23 (visual direction round); plan text of T6/T9/T12 amended in main before dispatch; implementers update docs/data-model.md and docs/api.md in the api worktree — why: new product-owner features need multi-item quotes — cost if wrong: one nullable JSON column and optional validation rules; features flagged as scope additions for tech lead approval.
Task 3: implementer DONE (commit 0909737; phpstan parseModelCastsMethod added; policies restore/forceDelete/reorder inferred); review dispatched
Task 3: review re-dispatched after rate limit (sonnet, agent a4f70e067a94a720d, package review-t3.diff a7e7524..0909737)
Task 3: review → Spec ✅, quality Approved.
Task 3: minor (deferred): AdminUserSeeder console warning literal Portuguese (console, not panel UI — tech lead to confirm); User $attributes duplicates migration defaults; FixedRecord/Inbox restore/forceDelete/reorder inferred; nav group placement untested.
Task 3: complete (commits a7e7524..0909737, review clean)
Task 4: dispatched (BASE 0909737, implementer sonnet, agent a2c9e38a1b7a4fe71)
Task 4: implementer DONE (commit 27aa85a; downloads disk url /downloads, phpstan trait.unused scoped ignore, media-library config TemporaryUpload ref fixed); review dispatched (sonnet, package review-t4.diff excludes composer.lock)
Task 4: review → Spec ✅, quality Approved.
Task 4: minor (deferred): no non-image (GLB) test through StoreImageMetadata (T10 covers GLB upload); StoreImageMetadata null mime_type guard; presentMany alt suffix " — n" untested; srcset nominal width fallback; phpstan trait.unused ignore to remove once models use the trait.
Task 4: complete (commits 0909737..27aa85a, review clean)
Task 5: dispatched (BASE 27aa85a, implementer sonnet, agent a1c2a4be0b38d34f5; R1 carried; T4 minors phpstan ignore + mime guard folded in)
Ruling (R7, T11): docs/api.md `GET /sitemap` row gains optional `key` (area key for category entries, page key for page entries), matching SitemapTest and the web client (P3 T5) — carry into the T11 dispatch.
Task 5: implementer DONE (commit f75973d; areas.description nullable + doc; finishes fk restrictOnDelete; phpstan ignore removed, HasImageConversions call order fixed); review dispatched (sonnet)
Task 5: review → Spec ✅, quality Approved.
Task 5: minor (deferred): areas.description nullable (doc updated, tech lead to confirm); finish_group_id restrictOnDelete; Area/Line/FinishGroup lack an ordered scope (later tasks order by sort_order explicitly).
Task 5: complete (commits 27aa85a..f75973d, review clean)
Task 6: dispatched (BASE f75973d, implementer sonnet, agent a1ca8fb0b1351e0db)
Task 6: implementer hit rate limit (composer.json/lock modified only); resumed same agent
Task 6: implementer DONE (commit 59d2e99; settings docblock shape removed; published settings config Data ref removed); review dispatched (sonnet)
Task 6: review → Spec ✅, quality Approved.
Task 6: minor (deferred): no GeneralSettings persistence test; footer_documents lost array-shape docblock (vendor parser limit); settings migration reads table name from config.
Task 6: complete (commits f75973d..59d2e99, review clean)
Task 7: dispatched (BASE 59d2e99, implementer sonnet, agent a9387eb26446ec4a6; R1/R2/R5 carried)
Ruling (R8, T8/T11 from P3 final review): Block schema is the docs/data-model.md pages.content table (authoritative); T11 documents in docs/api.md the resolved Block shape (texts in locale, images as absolute URLs) and that only rich_text.body and image_text.body are HTML; page intro stays plain text.
Task 7: implementer DONE (commit c20474a; media-library plugin installed; cover-required-to-publish kept as helper text)
Ruling (R9, T7): "cover required to publish" stays helper text, not validation — the mandated test publishes without cover; the spec does not require cover — cost if wrong: add a publish-time rule later (tech lead product decision).
Task 7: review dispatched (sonnet)
Task 7: review → Spec ✅, quality Approved.
Task 7: minor (deferred): no bulk publish/unpublish test; FilesRelationManager maxSize hardcoded 50MB; new dependency filament/spatie-laravel-media-library-plugin — list for tech-lead approval in PR.
Task 7: complete (commits 59d2e99..c20474a, review clean)
Task 8: dispatched (BASE c20474a, implementer sonnet, agent a3263a6bc0164ae45; R1/R2/R5/R8 carried)
Task 8: implementer hit rate limit mid-task (Collections/Designers/Launches/Projects/Clients partial uncommitted); resumed same agent
Task 8: implementer DONE (commit 3a43dd7; 72 tests); review dispatched (sonnet)
Task 8: review → Spec ❌ (Banner ends_at not validated after starts_at), quality Needs fixes.
Task 8: fix round 1/5 dispatched (resume implementer: banner window rule + test; lat/lng ranges; image_text/cta round-trip test)
Task 8: fix round 1/5 (3 addressed, 0 open; commits 3a43dd7..69a9bb7; controller-verified small diff)
Task 8: minor (deferred): only timeline/image_text/cta blocks have round-trip tests.
Task 8: complete (commits c20474a..69a9bb7, review clean)
Task 9: dispatched (BASE 69a9bb7, implementer sonnet, agent afe01e7262cd4007e; R2/R5/R6 carried)
Ruling (R10, T11 — from P4 pre-flight R4): GET /settings response = GeneralSettings public fields without contact_recipients, footer_documents as [{label (in locale), url (absolute)}]; T11 SettingsController emits exactly this and documents it in docs/api.md (P4 web does not edit docs/api.md).
Task 9: implementer DONE (commit 8f0dcfd; 93 tests); review dispatched (sonnet)
Task 9: review → Spec ✅, quality Needs fixes (Important: redirect to_path == from_path loop not rejected).
Task 9: fix round 1/5 dispatched (resume implementer; also pt_BR.json alphabetical merge)
Task 9: fix round 1 implementer hit rate limit mid-edit; resumed same agent
Task 9: fix round 1/5 (2 addressed, 0 open; commits 8f0dcfd..359464e; controller-verified diff)
Task 9: minor (deferred): no query-count assertion for items N+1; export download flow untested; pt_BR.json not globally sorted (pre-existing sections).
Task 9: complete (commits 69a9bb7..359464e, review clean)
Task 10: dispatched (BASE 359464e, implementer sonnet, agent aed3e4c4c04d4a58d; R1/R3 carried)
Integration: develop at d870347 includes API through T9 (359464e); merge again after T10/T11.
Task 10: implementer DONE (commit 6b89329; 129 tests; no-store not on 422/429 due to middleware order; facets aggregated in PHP); review dispatched (sonnet)
Task 10: review → Spec ❌ (no-store missing on 422/429, plan-mandated), quality Needs fixes (frontend key not hash_equals; LIKE wildcards unescaped in 3 paths; N+1 in /search collections).
Ruling (R11, T10): no-store middleware goes outermost, overriding the brief route block — contract says every read response — cost if wrong: none.
Task 10: fix round 1/5 dispatched (resume implementer, 6 items)
Task 10: fix round 1/5 implementer done (commit 51adb71; NoStoreCache renders exceptions itself + priority list); scoped re-review dispatched (sonnet)
Task 10: fix round 1/5 (6 addressed, 0 open; commits 6b89329..51adb71)
Task 10: minor (deferred): prependToPriorityList references ThrottleRequests — revisit if throttleWithRedis() is ever enabled.
Task 10: complete (commits 359464e..51adb71, review clean)
Task 11: dispatched (BASE 51adb71, implementer sonnet, agent aed39f4d26ae23f4f; R1/R7/R8/R10 carried)
Task 11: implementer DONE (commit b161334; 176 tests; Banner.title nullable vs web type non-null; downloads per_page added; finishes omit empty groups); review dispatched (sonnet)
Task 11: review → Spec ❌ (contract completeness: downloads per_page, finishes empty-group omission, Banner nullability undocumented), quality Needs fixes.
Ruling (R12, T11): keep per_page and the finishes omission, document both; Banner title/subtitle/cta nullable per data-model, documented; web Banner type to be made nullable on the web side (P4 T11) — cost if wrong: doc lines.
Task 11: fix round 1/5 dispatched (resume implementer)
Task 11: fix round 1/5 (5 addressed, 0 open; commits b161334..8dae9b7; controller-verified stat)
Task 11: complete (commits 51adb71..8dae9b7, review clean)
Task 12: dispatched (BASE 8dae9b7, implementer sonnet, agent a5756c42b9f89c771; R4/R6 carried)
Integration 2: develop 5cbaf8a = API through T11 (8dae9b7) + web through P4 T7 (4917c3a); pushed. Smoke: all main routes 200 with empty DB (/pt, /en, /pt/produtos, ?view=table, /pt/indoor, /pt/lancamentos, /pt/lojas, /pt/contato).
Task 12: implementer committed cd70445 (contact, newsletter, download links, Turnstile); task review NOT yet run — next step for whoever continues.
Handoff 2026-09-28: execution paused; see docs/HANDOFF.md.
