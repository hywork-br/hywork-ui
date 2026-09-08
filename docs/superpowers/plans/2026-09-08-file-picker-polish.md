# Shared file selection checkpoint

Scope: refine the existing FileUpload selection trigger using the canonical Button; no new upload service, API expansion or product migration. Required by the ongoing TV editor visual audit: browser-native file chrome appeared in English and diverged from the DS.

Source owner: `src/components/upload.tsx`. The native file input remains hidden and retains accept/multiple/change reset; the visible outline Button uses a field-specific accessible name, supports native keyboard activation and follows disabled state. Existing progress/cancel/retry behavior is unchanged. Consumers can pass empty items for local selection without claiming upload progress.

RED10587 failed the missing keyboard trigger assertion. GREEN15388 passed10 selection-control tests. Full check27978 exited0: tokens/manifest/typechecks/library build plus77 Node tests and178 Vitest tests. Real Storybook6006 test73458 exercised Enter → filechooser → selected-file callback in Chromium and Firefox at390px. Screenshots `/tmp/hywork-file-picker-chromium-390.png` and `/tmp/hywork-file-picker-firefox-390.png`; Firefox image inspected, button and focus visible. This is scoped behavior/visual evidence, not the full deterministic pixel gate.

Lab is still on source475527b and the previous artifact. Next: commit this owner change, package with clean provenance, adopt into Lab, replace its three TV native inputs with FileUpload using empty items and existing local decoder, and verify genuine chooser activation plus TV replacement/recovery. Do not claim Lab/Storybook parity until the exact new artifact is adopted and checked. Other program requirements remain open.
