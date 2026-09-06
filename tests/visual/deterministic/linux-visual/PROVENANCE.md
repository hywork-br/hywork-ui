# Linux visual baseline provenance

Approved from GitHub Actions run
[`33999864794`](https://github.com/hywork-br/hywork-ui/actions/runs/33999864794),
head `01a9d042`, using `mcr.microsoft.com/playwright:v1.63.0-noble` as `pwuser`.
The normal visual gate failed because the expected files did not exist and attached
these full-page candidates before the matcher. No snapshot-update command ran.

The controller inspected each source candidate at original resolution before copying:

| Baseline | Story / surface | Dimensions | SHA-256 |
|---|---|---:|---|
| `quality-admin.png` | `lab-interface-details--workspace` / admin | 1440 x 1000 | `dbd1aeddfebec91c513208eab07ee88bd59493eb57a6088a2fc5e0216dc93e89` |
| `collection-admin.png` | `patterns-coleções-operacionais--baseline` / admin | 1440 x 1032 | `7de12a517ede839c18bbea37d6b83d3ff411e18681c8aa68bc438cf474e59e86` |
| `quality-mobile.png` | `lab-interface-details--workspace` / portal | 390 x 1284 | `e6b35bcaa3ad1e18c90f1a0a3550b1ffdff5f3a10f349189767f23dd1215b8dd` |

Approval checked Montserrat rendering, hierarchy, expected empty search/selection,
desktop table completeness, mobile page containment and table-owned horizontal
overflow. The mobile baseline intentionally records the horizontally scrollable
table viewport; it is not a card-layout claim. Fixture data is illustrative.

The same run proved non-root browser identity and completed all 64 Storybook
Chromium/Firefox contracts. Its native suite exposed a separate Firefox evidence
ordering issue, fixed later in `101d36b`; that harness-only change does not alter
the captured stories, styles, viewport, browser image or baseline pixels. The next
normal Linux run must compare these files without updating them and pass exactly.
