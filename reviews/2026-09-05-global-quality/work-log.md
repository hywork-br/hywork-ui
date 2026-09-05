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
