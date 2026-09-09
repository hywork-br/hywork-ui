# Global-quality design system: execution contract

Approved direction: six capability axes, with functional animation. This is an improvement program,
not a claim of external certification. The objective is to finish the repository/lab deliverable.

## Boundaries

- Work only in `@hywork/ui` and its Storybook/test/governance sources. No Platform/Builder migration
  before October, production deploy, publish, or merge. Normal branch/PR handoff remains human-reviewed.
- Preserve the approved quiet controls, Montserrat, semantic paired colors and orange focus. Controls
  meet admin 32px minimum, portal/mobile 44px; narrow-screen text inputs use 16px.
- Consumers own data, authorization, network calls, filter taxonomy, persistence and business rules.
  New compositions expose controlled values/events. Fixtures must say they are demonstrations.
- New public capabilities remain **draft**, with structural justification rather than invented adoption.
- Animation explains selection, presence and feedback. No wholesale row entrances, hover displacement,
  artificial wait or motion blocking actions. Keyboard and reduced-motion paths are immediate; changing
  the media preference must work without reload. Keep Motion isolated to the laboratory until an
  explicit package-dependency decision; shared CSS/native controls can animate semantically.

## Deliverables

1. Selection foundation: checkbox/radio/switch, searchable single/multiple selection, dates/ranges,
   controlled upload progress/cancel/retry. Named controls, clear errors and real keyboard behavior.
2. Collections: page-scoped selection with mixed state, bulk actions, pagination, density, columns,
   saved views and combined filter criteria. A coherent Contents example demonstrates state changes.
3. Feedback: inline/banner/toast composition, undo, destructive confirmation, partial results, offline,
   permissions and conflict recovery without losing a draft. Guidance defines each channel.
4. Themes: reusable contrast validation plus a lab comparing light/dark/strong tenant accents and
   rejected unsafe combinations. No global dark-mode product migration or arbitrary brand invention.
5. Detail/motion lab: canonical cells and typography hierarchy, wrap/reveal rules, explicit state
   comparisons, usable mobile layout, meaningful animation with demonstrable reduced-motion parity.
6. Quality gates: real Storybook interaction runner and screenshot comparison in PR CI, keyboard,
   reduced-motion and browser coverage; demonstrate a regression fails before recording green.

## Proof of completion

Every capability has behavior tests and executable stories; final `npm run check`, `npm run build`,
consumer smoke, dependency audit and browser gates run against the final code. Desktop/mobile
screenshots and measured animated/reduced-motion flow go in `reviews/2026-09-05-global-quality/`.
Document failures honestly. CI configuration alone is not proof of a passing browser gate.
Work log lists all six deliverables and remaining October integration work. Never call consumers adopted.
