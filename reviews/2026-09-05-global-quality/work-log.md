# Global quality — execution work log, 2026-09-05

Scope: isolated `codex/interface-craft` laboratory/package work, continuing from
`100b04c`. Production products were not migrated. The six-axis program preserves
Montserrat, paired semantic colors, orange focus, quiet controls and domain ownership.

Verified implementation candidate: `5c171cd` (`test: protect draft contracts with
browser release gates`). The evidence log is committed separately so the candidate
is an unambiguous source revision for Linux CI and human review.

## Six axes and executed evidence

| Axis | Contract and evidence | Boundary |
|---|---|---|
| Selection | Choice, searchable selection, native date/range and controlled upload; SelectionControls play and selection unit tests execute. | Consumer owns options, file transport and business validation. |
| Collections | Real local filters/order, page selection, canonical cells, columns/density/saved views; Collections and CellsContract play execute. | Consumer owns remote pagination, identity, permissions, payloads and persistence. |
| Feedback/recovery | Feedback Recovery play executes draft preservation, conflict/retry, partial result, undo and permission fixtures. | Fixtures do not certify production networking or idempotency. |
| Tenant theme | ValidationLab play and numeric unit tests reject unsafe pairs; prior native evidence is indexed in checklist.md. | Validator scope is opaque colors and explicit adjacent surfaces, not universal dark mode. |
| Interface and motion | FullJourney and MotionContract play; direct Chromium/Firefox tests for native keyboard, visible semantic focus, three widths on both surfaces, axe and live reduced-motion entry/exit. | Motion adapters remain in stories; outgoing controls inert, keyboard/reduced paths immediate. |
| Governance and release | 80 runtime exports registered exactly once; seven new UI families and five theme utilities draft, generated status-aware manifest, executable stale-output failure, pinned browser gates. | No adoption or promotion before October; Linux pixels await CI capture and review. |

Task 1–5 composition evidence and exact prior commits remain in `checklist.md`;
this log does not rewrite those historical captures. All stories were rerun after
Task 6 integration: 64 tests passed across 24 Chromium/Firefox suite combinations.

## Defects found by the new gate

- Native Escape after saving failed because clearing the view name disabled its
  focused Save button. SavedViews now returns focus to the still-visible name input.
  New unit test failed before the fix; native Escape and Tab then passed in both browsers.
- Chromium's page-size select was 40px wide on portal/mobile. Its shared CSS now
  enforces the existing control-height token as minimum width as well as height.
- axe rejected named generic filter wrappers in the animated pilot. Shared and
  animated wrappers now expose `role=group`; semantic regressions failed then passed.

The geometry test checks the actual HTML-associated label for checkbox/radio hit
area and proves a pointer click outside the glyph toggles selection. It resolves
coordinates again after contextual content changes layout. Native inputs/buttons
without an associated label must meet their own size contract.

The mid-flight observer is installed before application media listeners, captures
opacity strictly between zero and one at preference change, and records final state
two rendered frames later. No animation duration changes or artificial app waits.

## Final local gate record

- `npm run check`: exit 0; token and manifest gates, both TypeScript configurations,
  library build, 22 Node tests and 116 Vitest tests in 15 files passed.
- `npm run build`: exit 0; ESM 53.22 KB, source map 97.40 KB, declarations 20.35 KB.
  Storybook built 2488 modules. Preview CSS 40.17 kB (gzip 7.29 kB), laboratory
  motion chunk 151.66 kB (gzip 49.75 kB); largest runtime chunk 1135.85 kB
  (gzip 324.35 kB). The >500 kB Storybook tooling warning remains visible.
  Exact library file size is 54,498 bytes. The distributed module has 80 runtime
  exports and no motion/framer-motion import; motion 13.2.0 is development-only.
- `npm run smoke:consumer`: exit 0; Next.js 16.3.4 webpack consumer compiled and
  exported all three static pages. This is a package fixture, not a product migration.
- `npm run test:stories`: exit 0; 64 tests, 24 suite/engine combinations; axe active.
- `npm run test:browser`: exit 0; 22 direct tests across Chromium and Firefox.
  Screenshots of the post-save focused input and numeric motion observations are
  retained in the browser report and generated test-results artifacts.
- `npm run test:comparator`: bootstrap exit 0, deliberate 40px padding mutation
  exit 1 with 3592 differing pixels, exact restoration exit 0. Mutated actual/diff
  remain under `test-results/comparator-mutated/`; product baselines untouched.
- `npm audit --audit-level=high`: exit 0; five moderate development findings, zero
  high/critical. `npm audit --omit=dev --json`: exit 0, zero vulnerabilities.
  The full audit exits 1 at its default threshold; this is not a clean full audit.
- Duplicate import scan: zero across 21 changed/new TS/JS files. Source scan:
  no debug logs, debugger statements or arbitrary colors; loopback URLs are test
  server configuration. `git diff --check 100b04c..HEAD` passed on candidate 5c171cd.
  The staged-file check caught four inherited blank EOF lines in new specs;
  those were removed and the staged check passed before the implementation commit.

Lockfile review compared all prior package objects against HEAD: 649 old entries
preserved, zero removals/changed existing package entries and no lost libc metadata;
420 entries added for the pinned test dependencies. The five moderate findings
come from the dev-only test-runner → uuid/jest-junit/nyc chain (GHSA-w5hq-g745-h8pq).
No force upgrade/downgrade was applied. Track an upstream compatible dev-tool fix.

Storybook 10's optional TypeScript config loader uses Node module hooks rejected
inside Jest's sandbox. The harness registers the same official runner hooks through
Jest's supported setupFilesAfterEnv; no dependency patch or runtime mock is used.
The host's unknown npm allow-scripts config and NO_COLOR/FORCE_COLOR warnings remain.

## Linux CI and October work still required

`npm run test:visual` was executed on macOS and failed all three scenes with the
explicit Linux-only guard. This proves the platform guard, not Linux screenshot
comparison. Docker daemon access was unavailable in the integration context.

The normal CI job uses `mcr.microsoft.com/playwright:v1.63.0-noble` and runs:
`npm ci`, `npm run build`, `npm run test:stories`, `npm run test:browser`, then
`npm run test:visual`. It uploads test-results and HTML reports even on failure.
Missing or changed expected pixels fail; PR CI never auto-updates product snapshots.

Controller must collect the first failing Linux actuals for quality-admin,
collection-admin and quality-mobile, inspect them, commit the reviewed PNGs under
`tests/visual/deterministic/linux-visual/`, and rerun CI to green. The 14 historical
September 1 PNGs retain their original provenance and are not comparator baselines.
No complete visual-release-gate claim is made until this Linux evidence exists.

October still requires real consumers, domain-specific permissions/data/network,
pilot evidence, adoption audit and explicit promotion. This worker did not push,
open a PR, deploy, publish, tag or merge; final review and branch handoff belong to
the controller and human reviewer.

## Review fix round 1 — base 7a5a23c

Implementation candidate: `ab3e2c4` (`fix: close contract and browser evidence gate gaps`).

Linux run 33998414032 (controller-collected evidence) passed the quality job and
11 Chromium native cases; Firefox rejected root with a pwuser-owned home. The
pinned container now uses `--user pwuser`, as documented by
[Playwright](https://playwright.dev/docs/docker), and a read-only preflight checks
non-root uid, matching home ownership and writable home/workspace. No HOME
override, chown, permission broadening or disabled browser coverage was introduced.
Only the next real Linux run can verify that environment correction.

Review found utility specs and actual play loss could escape the catalog gate.
An official Storybook CSF AST helper now validates explicit smoke/play contracts,
including direct or meta-inherited inline play and fail-closed dynamic syntax.
The ten render-only core families remain honest smoke contracts; Button/Field
and all seven new draft families plus theme utility retain required play.
Draft cannot bypass the obligation by changing its catalog label to smoke.
Utility docs require content/title and documented exports. Choice docs now state
native aria-invalid, not a nonexistent invalid prop. No source UI code changed.

Executed evidence:

- `CONTRACT_BASELINE_REF=7a5a23c node --test scripts/contracts-mutations.test.mjs`:
  RED exit 1, five genuine old-gate escapes. Copies run the actual CLI and assert
  execution, avoiding Node's silent nested-runner skip via NODE_TEST_CONTEXT.
- `node --test scripts/contracts-mutations.test.mjs scripts/browser-identity.test.mjs`:
  GREEN exit 0, 8 passed, loss/restoration and inheritance included.
- `npm run check`: exit 0, 30 Node + 116 Vitest tests; types, tokens, manifest passed.
- Missing-baseline comparator regression first failed (candidate count 0 versus 1).
  After explicit capture, `npm run test:comparator` exited 0: mutation still
  failed with 3592 pixels, restored fixture passed, missing expected still failed
  and stayed absent, while a real 1440 × 1416 candidate survived a 1000px viewport.
- Local identity guard exited 0 (uid/home owner 501); not a Linux success claim.

Normal visual tests now capture and attach scene-named full-page candidate PNGs
before comparison, with fonts ready, animations allowed and caret hidden. The
matcher never writes expectations. Controller must inspect these exact candidates,
not generic viewport test-failed PNGs, before committing Linux expectations.
Package/lockfile and 14 historical baselines are unchanged. Five dev-only moderate
audit findings, npm config/color warnings and Storybook chunk warning remain as
documented above; no indiscriminate package changes were made.

Final rebuild passed with unchanged output sizes. Repeated Storybook runner passed
64 tests/24 engine-suite combinations (36.915s); native browser suite passed all
22 cases (25.6s), regenerating success screenshots and in-flight observations.
Self-review added a getter mutation (RED exit 1, then restricted callable methods
to kind=method); inherited arrow/function/method and meta-spread rejection were
also exercised. Duplicate-import scan found zero across nine changed/new sources.
Linux startup and reviewed scene baselines still require the controller's next CI.
Final `npm run check` after the getter fix passed 30 Node + 116 Vitest tests,
both TypeScript configs and all build/token/manifest gates. No debug statements
were found; `git diff --check` passed. Controller checklist is excluded from staging.

## Review fix round 2 — base b50d8b7

Reviewer demonstrated that computed own play keys could be ignored by the CSF
parser while overriding meta at runtime, and generator functions were accepted
although calling them does not execute their bodies. The gate now rejects
computed/unresolved top-level property keys before inheritance and requires
non-generator play functions/methods. No new CSF evaluation or parser was added.

Before the helper changed, `node --test --test-name-pattern='unresolved CSF'
scripts/contracts-mutations.test.mjs` exited 1 with eight failing mutations
(8.889s): computed story literal/expression, computed meta override, generator,
async generator, inherited generator, generator method and async generator method.
All were genuine old-gate escapes (actual exit 0 versus required 1); the helper
diff was empty against b50d8b7 at RED. After the fix, `node --test
scripts/contracts.test.mjs scripts/contracts-mutations.test.mjs` passed all 15
tests (23.019s), including real CLI failure and restoration for each mutation.
The supported-CSF document now states these exclusions. No UI/stories, CI,
dependencies, lockfile or visual baselines changed; controller checklist preserved.
Final `npm run check` exited 0: 38 Node tests (23.313s), 116 Vitest tests in 15
files (7.54s), both TypeScript configs, tokens, manifest and library build passed.
Duplicate-import scan found zero in the two edited modules; diff check passed.
Browser/visual suites were not rerun for this parser-only change. Linux startup
and screenshot evidence remain separate controller gates, not inferred success.

## Review fix round 3 — base 8948b8e

The same incomplete-annotations root also affected simple quoted keys. With the
helper unchanged, `node --test --test-name-pattern='quoted play'
scripts/contracts-mutations.test.mjs` exited 1 (6 failed/2 passed, 9.802s), showing
both quoted undefined overrides escaping and valid quoted functions rejected.
Ownership/value selection now reads the last matching Identifier/StringLiteral
property directly from the validated top-level AST, in source order. Own undefined
does not inherit meta. No annotations are used for that decision; computed keys,
spreads, unresolved expressions, generators and accessors retain their guards.

`node --test scripts/contracts.test.mjs scripts/contracts-mutations.test.mjs`
passed 23/23 (35.773s), including quoted own/meta values and duplicate-key order,
plus the previous mutation regressions and restoration of each real contract.
A direct-helper matrix passed 40/40 probes: identifier/quoted keys × own/meta ×
five accepted function forms and five rejected values/generator forms. No separate
root/bypass appeared. No product code, story, CI, dependency or baseline changed;
the controller's checklist remains excluded from staging.
Final `npm run check` passed: 46 Node tests (36.211s), 116 Vitest tests/15 files
(7.90s), both TypeScript configs, tokens, manifest and library build. Duplicate
imports: zero in both edited modules; diff check passed. Browser/visual execution
was not repeated for this parser-only round; Linux evidence remains separate.

## Review fix round 4 — native reduced-motion evidence

Linux run 33999864794 isolated the remaining browser failure to Firefox entry:
the pre-mount probe and application each owned a separate native MediaQueryList,
so Firefox could settle the application before the probe sampled the change.
The browser harness now wraps `matchMedia` before application startup, attaches
its observer to the exact native object returned to the application, and returns
that object unchanged. It neither mocks preference state/events nor changes app
motion duration.

After a real partial-opacity frame appears, the harness pauses only the target's
native opacity animation and triggers Playwright's native reduced-motion emulation.
Evidence requires a trusted matching media event, identical held animation time,
unchanged document time origin, and cancellation to `idle` by the existing app
policy. Entry still must settle to opacity 1/height auto; exit must already be
inert and then be removed. Partial-opacity assertions remain strict.

Mutation proof rebuilt the served Storybook with the app's stop/set/inline
settlement temporarily removed. Firefox entry failed exactly at the new behavior
assertion (`Expected idle`, `Received paused`). Production source was restored
with no diff and rebuilt; focused Chromium+Firefox then passed 4/4.
This exact RED result is worker-reported: its later reporter run overwrote the raw
artifact before independent review. The retained earlier `paused/running` artifact
is a different harness iteration and is not cited as proof of cancellation failure.
The committed strict `finalAnimationState === idle` assertion and the four GREEN
JSON artifacts remain independently inspectable.

Final `npm run test:browser` passed 22/22 (25.2s). The final evidence values were
Chromium entry 0.0519651 and exit 0.864636; Firefox entry 0.0386989 and exit
0.974422. All four recorded trusted native events, the held partial state at the
event, cancellation to idle, unchanged time origin and policy instant.
`npm run typecheck` exited 0. `npm run check` exited 0 with 46 Node tests and
116 Vitest tests/15 files, plus tokens, manifest, both TypeScript configs and
library build. No product/story source, dependency, lockfile or baseline change
is part of this round. The controller checklist remains excluded from staging.

## Reviewed Linux baseline capture — run 33999864794

The pinned Noble container passed the non-root `pwuser` identity preflight, library/
Storybook build and all 64 Storybook Chromium/Firefox contracts. The normal visual
gate returned nonzero for exactly the three absent expectations and attached the
named full-page candidates without writing expected files. The controller downloaded
`browser-evidence-linux` and inspected all three original-resolution PNGs.

The approved copies are now explicit baselines under
`tests/visual/deterministic/linux-visual/`. Their source run/head, story/surface,
dimensions, SHA-256 values and visual acceptance notes are recorded in the adjacent
`PROVENANCE.md`. Mobile records the contractually table-owned horizontal viewport,
not a card-layout claim. No snapshot update command was used.

Run 33999864794 also exposed the Firefox native evidence race fixed by `101d36b`;
that commit changes only the browser harness and this work log, so it cannot alter
the story pixels copied from head `01a9d042`. A subsequent normal Linux CI run must
prove the new baselines byte-for-byte and the corrected native motion gate together.

## Review fix round 5 — Firefox Linux pause commitment

Linux run 34005488691 passed quality, all three reviewed visual baselines and all
64 Storybook contracts. Native passed 21/22. Firefox entry alone timed out inside
the partial-frame page evaluation: the click completed in 93ms, no partial-frame
attachment was produced, and the only unresolved branch after observing the real
animation was the promise returned by `animation.ready`. The prior Linux run's
0.0395517 entry partial disproves a missing animation or missing rendered frame.

The leading hypothesis is the harness waiting indefinitely for Firefox Linux to
resolve `ready` after `pause()`. The trace does not distinguish that branch from
the preceding frame-sampling loop and does not establish a browser-internal cause;
evidence from the earlier run is contextual, not same-run proof. Web Animations
provides `pending` to report asynchronous play/pause operations. The harness now
commits the pause by inspecting native state instead:
an initial microtask plus at most four animation-frame checks must observe the same
opacity animation as paused, non-pending, with finite current time and opacity still
strictly partial. Failure rejects immediately after the bounded checks with the
observed state. No test retry, elapsed-time sleep, duration/currentTime/style change
or playback-rate fallback was added.

The media event additionally records and asserts non-pending pause state alongside
the unchanged held currentTime, trusted matching preference event, unchanged time
origin, app cancellation to idle and final entry/exit settlement. Five repeated
entry/exit runs per browser passed 20/20; every artifact committed on frame check 1.
The full native suite passed 22/22 (26.4s). Final partial opacity was Chromium entry
0.0525291/exit 0.892338 and Firefox entry 0.0378456/exit 0.973712. `npm run typecheck`
and `npm run check` exited 0; check covered 46 Node tests, 116 Vitest tests/15 files,
both tsconfigs, tokens, manifest and the library build. No product/story, dependency,
lockfile or visual-baseline change belongs to this round.
