# Global Quality Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: use superpowers:subagent-driven-development.

**Goal:** Finish the six approved design-system capability axes, including functional animation.
**Architecture:** Small controlled React primitives and compositions; shared semantic CSS; domain
fixtures in Storybook; deterministic unit contracts plus actual browser tests and visual baselines.
**Tech Stack:** React, TypeScript, Radix, Vitest, Storybook, existing Motion lab, browser CI tooling.
**Spec:** `docs/superpowers/specs/2026-09-05-global-quality.md`

## Global Constraints

- Worktree: `/Users/vitorferreira/Documents/hywork/.worktrees/hywork-ui-maturity`, branch `codex/interface-craft`.
- No product migration before October, production deploy, publish or merge. No invented consumer adoption.
- Preserve Montserrat, semantic paired colors, orange visible focus, quiet controls and domain identity.
- Admin targets at least 32px; portal/mobile targets at least 44px; narrow-screen input text at least 16px.
- Consumers own data, permission, network, persistence and business rules. New capabilities are draft.
- Motion remains laboratory-only; no artificial waits, row choreography or hover displacement.
- Keyboard/reduced-motion paths are immediate; dynamic preference changes work without reload.
- Use apply_patch for edits, keep files focused, preserve others' work. No subagents from implementers.
- Use TDD for behavior. Record RED/GREEN commands and output. Commit only owned files, after checking branch.
- Tooling PATH: `/Users/vitorferreira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin`.

### Task 1: Complete the controlled selection foundation

**Own:** `src/components/choice.tsx`, `combobox.tsx`, `date-field.tsx`, `upload.tsx`, corresponding
`src/test/selection-controls.test.tsx`, `stories/SelectionControls.stories.tsx`, `tokens/selection.css`,
and append imports/exports in `tokens/tema.css`, `src/index.ts`. No other existing component redesign.

1. Add failing behavioral tests: checkbox mixed and native form value; radio exclusivity; switch
   Space/disabled; combobox ArrowDown/Up, Home/End, Enter, Escape, disabled options, empty search,
   multi-selection preserved while query changes, no accidental parent form submit; named date range
   with invalid order/error linkage; upload cancel/retry callbacks and progress bounds.
2. Implement Checkbox (native input with indeterminate), Radio (native grouped input) and Switch
   (native checkbox role switch). Support refs, standard input props, label composition and disabled.
3. Implement Combobox controlled `options: {value,label,description?,disabled?}[]`, `value: string`,
   `onValueChange`, `aria-label`, placeholder; MultiSelect corresponding `value:string[]` API.
   Use ARIA combobox/listbox active descendant, multiselect semantics, named remove actions and explicit
   count. Search is local; do not invent async fetch. Options retain stable IDs; disabled skipped.
4. Implement DateField with native date input and DateRangeField with controlled `{from,to}` values,
   labels, min/max and invalid chronological order feedback. Document locale-native display vs ISO values.
5. Implement controlled FileUpload with labelled native file input and items `{id,name,progress,status}`
   (`uploading|complete|error|cancelled`), optional error, `onFilesChange`, `onCancel`, `onRetry`.
   No simulated network inside component. Only show working actions; show a native progress element.
6. Style in selection.css using existing tokens; build interactive stories demonstrating all states and
   a `play` keyboard contract. Upload fixture actually transitions cancel/retry/completion, labelled demo.
7. Run focused tests RED then GREEN, typecheck, full tests once; self-review and commit conventional feat.

### Task 2: Deliver operational collections and canonical cells

**Own:** `src/patterns/data-table.tsx`, new `collection-controls.tsx`, `src/components/table-cells.tsx`,
`src/test/collection-controls.test.tsx`, `stories/Collections.stories.tsx`,
`stories/collections/collection-demo.tsx`, `tokens/collections.css`, and corresponding index/CSS imports.

1. Test page-scoped select-all/mixed/disabled selection, no fake sorting, controlled pagination bounds,
   changing page/filters, hiding columns without losing the required identity column, saved-view restore,
   multi-person AND status/date criteria, truncation reveal via keyboard.
2. Extend DataTable with optional controlled selection (keys, onChange, accessible row label, disabled
   predicate), optional controlled sort, and density. Existing API remains compatible; nonfunctional
   sort buttons are not shown. Select-all affects eligible visible rows only and preserves other-page keys.
3. Add Pagination with page/pageSize/total and callbacks, visible range and named navigation; column and
   density controls; SavedViews presentational controlled selector with save/delete callbacks. Do not own
   persistence/network in package. Keep DataTable a semantic table, not an ARIA grid.
4. Add canonical PersonCell, StatusCell, DateCell, NumberCell and ContentCell with meaningful text,
   locale formatting, missing-value treatment and optional thumbnail. Essential identity can wrap;
   optional long metadata can reveal through accessible disclosure, not hover-only title.
5. Build Contents collection demo: combined search/status/multiple authors/date interval, pagination,
   selection, bulk archive with explicit page scope, columns/density, saved views in versioned
   sessionStorage with safe parsing. Reset page on criteria change; clamp after mutations; visible counts
   distinguish total/filtered/page/selected. Keep usable 320px outer reflow with independent table scroll.
6. Run behavioral tests RED/GREEN, typecheck, full tests once; add Storybook play selection/filter/restore;
   self-review and commit. Motion wiring/visual detail showcase handled Task 5, not copied engines here.

### Task 3: Unify feedback and recovery

**Own:** `src/components/feedback.tsx`, `src/test/feedback.test.tsx`, `tokens/feedback.css`,
`stories/Feedback.stories.tsx`, `stories/feedback/recovery-demo.tsx`,
`governance/feedback-content.md`, plus index/CSS imports.

1. Test non-urgent status vs alert semantics, dismiss/undo callbacks, no inaccessible timed removal,
   pending destructive confirmation, partial success retry only failed IDs, offline draft preserved,
   conflict resolution explicit, permission removal prevents action.
2. Add small controlled InlineNotice, Banner and Toast compositions with severity, title, optional
   description/action/dismiss; reuse Button, Dialog/AlertDialog for confirmation. Never perform network,
   implicitly delete data or claim success before consumer acknowledgement.
3. Demonstrate fixture-only recovery workspace: edit draft, toggle offline/permission/conflict, save,
   resolve conflict preserving local draft, archive with undo, permanent delete with confirmation,
   partial bulk outcome with failed item names and retry. Label simulated state; all visible actions work.
4. Define guidance and PT-BR copy examples for inline/toast/banner, undo vs confirmation, scope/counts,
   loading/empty/error, permission/offline/conflict. Explain live-region announcement strategy (no duplication).
5. RED/GREEN focused tests, executable play, typecheck and full tests once; self-review and commit.

### Task 4: Validate tenant themes without migrating products

**Own:** `src/lib/theme-validation.ts`, `src/test/theme-validation.test.ts`, `stories/Themes.stories.tsx`,
`stories/themes/theme-lab.tsx`, `tokens/theme-lab.css`, `governance/theme-validation.md`, index if exported.

1. Test actual WCAG sRGB contrast math against black/white and boundary values, malformed/unsupported
   inputs fail closed, foreground/background pairing, focus vs adjacent surfaces, normal text 4.5:1 and
   nontext focus/boundary 3:1. Transparent colors unsupported unless composited explicitly.
2. Expose pure validator returning structured ratios, required thresholds and failures; no DOM/global
   mutation. Input resolved opaque CSS colors (document supported formats). Tenant primary, primary-fg,
   background,text and focus adjacency tested. Do not silently replace unsafe tenant branding.
3. Lab samples use existing brand primitives through `--color-*` tenant contract; compare approved strong,
   light and dark accent combinations plus intentional failing pair labelled rejected. Provide details
   and actionable explanation for failure. Native color edits validate before applying preview.
4. Document app integration responsibilities and missing October adoption. No claim that this alone
   implements whole-product dark mode. Add mobile/long-label cases to same lab.
5. RED/GREEN math/contract tests, story play validation, typecheck and full tests once; self-review/commit.

### Task 5: Establish detail and functional-motion quality lab

**Own:** `stories/InterfaceDetails.stories.tsx`, `stories/details/quality-workspace.tsx`,
`stories/details/details.css`, `src/test/interface-details.test.tsx`, minimal existing motion adapter
extensions if needed, and `governance/interface-details.md`.

1. Compose the new primitives into an intentional minimal admin workspace: collection controls and
   canonical cells as the main surface, contextual bulk feedback and a compact editing example. Avoid
   dashboard decoration and a card around every block. Preserve Contents domain, Montserrat and tokens.
2. Add explicit approved vs counterexample detail specimens for hierarchy, cell alignment, wrapping,
   truncation/reveal, empty metadata, hit areas and distinct hover/selected/focus/error/disabled.
3. Reuse existing PilotMotionScope policy for selection/bulk-action presence and status feedback. Extend
   adapter rather than duplicate it. Animate meaningful opacity/short distance or measured height using
   existing durations/easing; outgoing controls inert. Input/keyboard interactions stay immediate; dynamic
   reduced-motion preference is honored. No layout shift from loading labels or false success timings.
4. Add actual behavior tests proving selection feedback, focus when contextual controls disappear,
   edit failure preserves content, and motion policy changes. Storybook play validates full journey.
5. Run focused RED/GREEN, typecheck/full tests and build. Controller does native-browser visual review:
   desktop/mobile screenshot, focus/portal check, animated frame sampling and reduced-motion parity.
6. Document usage rules with example links; self-review and commit implementation. Browser artifacts may
   be added by controller after independent review and integrated build.

### Task 6: Protect contracts and release gates

**Own:** catalog/spec/status/manifest scripts, `governance/pattern-contracts.md`, `.github/workflows/ci.yml`,
browser test config/scripts/tests, `tests/visual/README.md`, package.json/lock, new component specs,
contract story registration and final work log. Do not rewrite previous evidence or claim adoption.

1. Register new public APIs as draft with structural justification, specs and executable story references.
   Make manifest generator group by actual status rather than treating all component families as beta.
   Replace fixed 12-family assertions with integrity tests that catch missing/duplicate exports/specs/stories.
   Prove generated manifest check rejects stale output. No manual generated manifest edits.
2. Add browser test harness compatible with installed Storybook, executing its `play` contracts plus
   direct browser assertions for keyboard, reduced motion, responsive overflow and accessibility.
   Use browser tooling only through permitted runtime for agent interactions; test harness code may use
   official test-runner APIs. Pin new test dependencies; inspect lockfile churn, preserve unrelated entries.
3. Add screenshot comparison with committed deterministic baselines for new quality/collection/mobile
   scenes; pin browser/OS assumptions, freeze nondeterministic content, fonts loaded, wait for settled UI.
   CI uploads failure diffs. New/changed baseline never silently passes. Run Chromium and Firefox/WebKit
   relevant interaction coverage; document available local vs CI-only execution honestly.
4. Run a controlled failure demonstration (temporary CSS mutation or comparator fixture), observe nonzero,
   restore exact original, then green. Run full browser gate; don't call a workflow file proof of execution.
5. Final npm check/build/consumer smoke/audit, duplicate import and debug/hardcode scan, git diff --check.
   Write dated review evidence and work log covering all six axes, build sizes and limits/October tasks.
6. Self-review/commit; controller performs broad final review and fixes, final verified branch/PR handoff.
