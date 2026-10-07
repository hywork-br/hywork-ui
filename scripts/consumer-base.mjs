// The consumer's base CSS as the design system contract expects it.
//
// provenance/platform/context.css is the admin's globals.css as captured on
// 17/09/2026. It still declares --primary, --background… in :root and .dark,
// which the contract forbids since 06/10/2026: the design system declares
// them (tokens/core.css) and the consumer only sets --hw-brand-primary.
//
// The catalogue CSS is built from this stripped version, so the Storybook
// renders exactly what a consumer that follows the contract gets. The raw
// capture stays untouched — it is the frozen reference for the parity test.
const VARIABLE_BLOCK = /^(?::root|\.dark)\s*\{[^}]*\}\s*/gm;

export function consumerBase(context) {
  return context.replace(VARIABLE_BLOCK, '');
}
