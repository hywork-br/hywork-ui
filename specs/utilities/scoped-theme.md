# Scoped theme resolution

Draft. Owners: Hywork Product Design and Hywork Frontend. No product adoption or migration.

`ScopedThemeCandidate` is a complete record of opaque CSS colors: primary, primaryHover,
primaryForeground, primaryText, primarySoft, primarySoftForeground, background, surface,
subtle, text, textMuted, focus, inputBorder, floating, floatingForeground, interactiveHover
and interactiveHoverForeground. Missing/unresolved colors reject atomically. Accepted formats
are the existing numerical utility's opaque hex and integer rgb formats.

`defaultScopedTheme` is a frozen canonical palette generated from CSS tokens, validated when
the module loads. It is not read from document styles, storage, network or tenant configuration.

`resolveScopedTheme` accepts candidate and returns valid, checks, failures and either a complete DS token
map or null. Required pairs include button fill/hover, soft/accent ink, input baseline,
floating/interactive surfaces, focus and supported canonical inverse/error/warning adjacency.
Text uses4.5:1; focus and baseline use3:1. Caller lists cannot remove required checks.

`resolveScopedThemeUpdate` accepts candidate and optional previous, and validates both inputs. An accepted candidate
wins; otherwise a valid previous candidate wins; otherwise the canonical default wins. It returns
source, candidate validation, copied/frozen applied values and copied/frozen tokens. Rejected
candidate values are never merged into fallback tokens. This is a pure transition, not storage.

Only supported component roles are covered; arbitrary CSS, transparent colors, full-product
dark mode, authorization, persistence and consumer-specific surfaces remain outside this contract.
The React provider adds the scoped color-motion policy; this pure numerical resolver does not
control CSS transitions. See [ThemeScope](../components/theme-scope.md).
