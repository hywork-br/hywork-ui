# ListPage intrinsic-width regression

The Lab Data field actions exposed document-level horizontal scrolling at390px. Browser ancestor measurements showed a358px ListPage with a501px implicit grid track. DataTable already owned overflow:auto, but the containing auto-minimum grid prevented its viewport from shrinking.

Added scripts/verify-list-page-overflow.mjs, rendering real packaged ListPage/DataTable with canonical CSS and focusing the final column action. RED05e566 reproduced overflow and document displacement. The shared CSS now uses minmax(0,1fr) tracks and zero minimum inline width for direct grid children. Explicit card-grid rules remain later in the cascade.

GREEN0b97c9 and4d2373 passed Chromium/Firefox1440,768,390,320. The narrow table remains horizontally scrollable internally and its action remains focused; document overflow and scrollX stay zero. Screenshots are under .superpowers/sdd/2026-09-08-list-page-overflow/. npm run check52497/814fd5 passed token/manifest/type/library checks,77 script tests and180 Vitest tests. Added the regression to test:browser. Full Storybook build and broad browser gate are not yet rerun.

Lab still consumes its previous approved artifact. Do not claim integrated correction or final parity until this DS revision is reviewed, packaged with clean source provenance, adopted and rebuilt in Lab, and verify-data-schema passes without CSS injection. No production migration, deployment or completion claim.

## Packaging review gate

Storybook buildc639c1 passed. Broad browser6256/c6b0d4 passed124 Chromium/Firefox contracts and the eight overflow cases. Independent read-only list_page_review found no functional CSS regression and requested stronger internal-scroll evidence. The regression now checks scrollable overflow mode, positive scrollLeft and visible focused-action bounds. Native Chromium rounding produced a0.265625px difference with integer scrollLeft; comparison now uses rounded pixel geometry, without changing screenshot tolerances or production CSS. All eight strengthened cases passed40ffc8. Grid card rules retain later explicit cascade precedence; dedicated new card-regression coverage remains a minor follow-up.
