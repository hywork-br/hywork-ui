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

Remaining axes and final integrated gates are pending. These component measurements do not certify
the final workspace, all contrast pairs, production adoption or the program as complete.
