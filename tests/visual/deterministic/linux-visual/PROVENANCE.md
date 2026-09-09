# Linux visual baseline provenance

Regenerated on 2026-09-09 from head `8af8510b` inside
`mcr.microsoft.com/playwright:v1.63.0-noble`, the same pinned image used by the
browser CI job. The update command was restricted to `tests/browser/visual.spec.ts`
with `--project=linux-visual --update-snapshots`. This local capture is not the
approval gate: the next GitHub Actions run must pass against these files without
updating them.

The local container capture inspected each source candidate at original resolution:

| Baseline | Story / surface | Dimensions | SHA-256 |
|---|---|---:|---|
| `quality-admin.png` | `lab-interface-details--workspace` / admin | 1440 x 1000 | `f8d3600f88395dfb88ea88b5c8079b965c78d6cf475e2d7568bb2ba6c9049293` |
| `collection-admin.png` | `patterns-coleções-operacionais--baseline` / admin | 1440 x 1032 | `30add26545e47420ac401a349dee4d51389c3d54157e8e580da2387b1583ab2d` |
| `quality-mobile.png` | `lab-interface-details--workspace` / portal | 390 x 1344 | `91dc5dc62fbe925d0f366d73f043aac483f7c047f21c557daf15e267259c470d` |

The capture checked Montserrat rendering, hierarchy, expected empty search/selection,
desktop table completeness, mobile page containment and table-owned horizontal
overflow. The mobile baseline intentionally records the horizontally scrollable
table viewport; it is not a card-layout claim. Fixture data is illustrative. The
next normal Linux run must compare these files without updating them and pass exactly.
