# Stepper readability repair

Approved end-to-end UI work exposed a clipped final Academy step inside a 42rem form. Root cause: each item had max-content minimum width inside a horizontally scrolling list; disabled future steps could not be revealed through normal Tab focus.

Repair the shared component CSS, not the Lab consumer. Preserve completed-step callbacks, disabled future steps, DOM reading order and semantic state. Allow responsive wrapping and long labels while keeping markers circular. No new tokens or product migration.

## Evidence

- Browser RED46969: all eight initial Chromium/Firefox cases failed `geometry.fits`, widths1440/768/390/320.
- Build46969 (subsequent reused tool handle) exited0 after CSS repair; browser49543 passed all eight cases. Main inspected desktop and mobile screenshots.
- npm check6805 exited0: tokens, manifest, both TypeScript configurations, library build,77 Node tests and176 Vitest tests.
- Independent read-only reviewer found no Critical/Important issues; accepted pending fresh checks after deriving story statuses from current state.
- Fresh build23819 exited0; browser2306 passed16 cases spanning admin/portal, Chromium/Firefox and all four widths. Tests assert internal bounds, label bounds, disabled future controls and completed-step keyboard activation. Reduced motion is enabled.

This is local shared-component acceptance only. The Lab must adopt the actual packaged revision and rerun its Academy flow. Linux deterministic pixel approval and the broader UI program remain open.
