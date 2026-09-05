# Review worksheet — global quality

Baseline: `857279e` (before this execution program). Source: local Storybook fixtures, not production.
Reference screenshots and measurements must be associated with their exact commit and viewport.

## Initial observation

Conteúdos currently has a quiet open toolbar and a readable three-row table. At 320px the page is
320px wide and Montserrat resolves on the product heading. Preserve those properties when adding
collection operations; additional capabilities must not turn the main toolbar into a form wall.

## Visual and interaction acceptance

- Collection desktop: title dominates toolbar; one primary action; filters have clear priority;
  bulk controls appear only with selection; selection scope is explicit.
- Narrow screen 320px and mobile 390px: page itself does not overflow; table may scroll independently;
  controls wrap; panels and focused outlines stay inside viewport; editable input text is at least 16px.
- Keyboard: focus is visible, selection actions are named, Escape closes a selector, removed contextual
  controls return focus predictably, no focus falls to body after an initiated action.
- Metadata: numbers align, dates have understandable locale display, identity is not irretrievably cut,
  missing metadata is explicit, statuses have text.
- Error/recovery: pending action cannot repeat, partial result lists failures, draft survives offline and
  conflict paths, permission state does not expose a working forbidden action.
- Motion: capture intermediate frames, not only start/end; no early collapse or focusable outgoing node;
  keyboard and reduced-motion paths are immediate, including after preference change without reload.
- Theme: unsafe pairing is rejected visibly with the failing role/ratio; no claim of production validation.
- Automation: execute the play contracts and visual comparison; demonstrate one deliberate regression
  causes a failing exit before restoring and obtaining green.

## Evidence index

### Selection foundation — 066c661

- Initial keyboard story play succeeded: selected Campanhas while skipping disabled TV, closed popup,
  reopened and Escape returned focus to input.
- Native browser at390×844: document390px; fileinput278×44px, font16px; all associated choice labels44px.
- Native browser at320×740: document320px; fileinput208×44px. No horizontal page overflow.
- Before the fix, fileinput intrinsic size expanded document416px in390viewport; confirmed fixed after
  `min-inline-size:0` on wrapper and explicit constrained inputwidth.
- `before-contents-desktop.png`: original collection baseline1440×1000, pre-program UI.
- `selection-mobile.png`: selection composition390×844 after fix (laboratory fixtures).

### Operational collection — a609a89

- Storybook play reached selection, search Cultura, save view and restore Cultura successfully.
- After typography correction: desktop1440 body14px, title24px, document1440px.
- Mobile390: every measured text/date input and select16px/44px; document390px.
- Intermediate600: selects16px/44px; document600px (font breakpoint aligned to40rem).
- At320: outerpage320px, table scroll region256px with757px scrollable contents.
- `collection-mobile-functional.png`: functional composition after surface fixes, before Task5 final
  visual integration. It is not an approved final mobile layout.

### Feedback and recovery — 1e98e83

- Storybook play exercised offline draft preservation, explicit conflict resolution, save, archive/undo,
  partial publication/retry, cancel focus in destructive confirmation and permission gating.
- Native390×844: document390px, dialog358px, Montserrat loaded, initial focus Cancelar.
- Confirmation actions: Cancelar outline and Excluir definitivamente danger, both44px tall.
- `recovery-confirmation-mobile.png`: refreshed after cancelling action changed from filled to outline.
- Independent review has no Critical/Important findings. Minor operation-scoping observation remains
  for final review (partial bulk failure should not style a later save message as warning).

### Tenant theme validation — 238173b

- Native Storybook play reached the approved dark accent after testing a rejected combination.
- At1440×1000, the operable preview button rendered rgb(9,41,56) with white text and opacity1.
  Its local action displayed “Prévia confirmada localmente.” without navigation or persistence.
- Selecting the intentionally rejected white-on-white candidate left that actual button pair intact;
  a visible alert explained the 1:1 ratio and the 4.5:1 minimum using human PT-BR role labels.
- All three primitive-resolved presets were exercised in the native browser: strong accent6.93:1,
  light accent13.69:1, dark accent15.15:1, no rejection alert. These are preview text/primary ratios.
- At390×844, document390px, Montserrat loaded, editable inputs16px and heights48/44px.
  Initial preflight also measured320px outer reflow and preset button targets44px or more.
- `theme-validation-desktop.png` records rejected candidate, retained active preview and local result.
  `theme-validation-mobile.png` records the mobile rejection explanation.
- These screenshots demonstrate the scoped prototype adapter, not automatic theming of every public
  component, whole-product dark mode, or October consumer adoption.

### Integrated details — 5cc5c13 (before behavioral fix round)

- `interface-details-desktop.png`: working Contents collection at1440×1000, bounded search,
  contextual preferences, canonical cells and no bulk controls without selection.
- `interface-details-mobile.png`: same collection at390×844, document390px, search358×44px/font16px;
  Status and More filters now share a wrapping row. Horizontal scrolling belongs to the table only.
- `interface-editor-mobile.png`: opening the real first-row edit action at390 focused the title field,
  placed its full44px target in view (top500/bottom544), preserved draft/collection and page390px.
  Closing the editor returned focus to Buscar conteúdos near the top of the page.
- `interface-preferences-desktop.png`: initially hidden column/density/saved-view controls opened
  explicitly without replacing the table or introducing a second copy of collection state.
- `interface-detail-comparison.png`: approved/static-counterexample criteria at1440×1280.
  At320px the specimen page measured320px and its editable field remained16px/44px.
- `native-motion-observations.md` contains measured intermediate entry/exit frames and limitations.
- FullJourney's native run exposed an immediate visibility assertion racing animated entrance.
  Fixceba670 completed the native journey with7total/0selected, saved-view status and final preference
  trigger focus. Reduced clear was rerun:0remaining contextual nodes, search focus, document320px.
  Native Tab/Escape immediately after the save-view button disables remains a direct harness gate.

Remaining fixes and final integrated gates are pending. These component measurements do not certify
the final workspace, all contrast pairs, production adoption or the program as complete.
