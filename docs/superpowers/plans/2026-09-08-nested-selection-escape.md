# Nested selection Escape ownership

The Content authoring browser flow exposed a discard prompt while dismissing an expanded audience selector. Dialog's native capture listener ran before the selection's React key handler, so stopPropagation in the child was too late.

Repair in shared DialogContent, preserving a consumer's onEscapeKeyDown callback. An expanded combobox owns the first Escape; after its popup closes, a subsequent Escape retains normal dialog dismissal. No Lab-only key workaround and no change to publication or the October migration gate.

Evidence: RED122bbe reproduced dismissal of FocusMode containing a real MultiSelect. GREEN78246 passed9 lifecycle cases, followed by the complete check: tokens, manifest, TypeScript, library build,77 Node tests and177 Vitest tests. Local consumer packaging and browser revalidation remain necessary; this document does not claim adoption or full-program completion.
