/** Resolve the repository's opaque hex primitives and single-token aliases.
 * This is a build-time projection of the canonical CSS, not a browser CSS parser.
 */
export function resolveColorTokens(...layers) {
  const declarations = new Map();
  for (const layer of layers) {
    const source = layer.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, token, raw] of source.matchAll(/(--hw-[\w-]+)\s*:\s*([^;{}]+);/g)) {
      const value = raw.trim();
      const previous = declarations.get(token);
      // Motion media queries legitimately repeat duration values. A repeated
      // color or alias is ambiguous for a deterministic server-side default.
      if (previous && [previous, value].some((entry) => /^(#|var\()/.test(entry))) {
        throw new Error(`Duplicate color declaration: ${token}`);
      }
      declarations.set(token, value);
    }
  }
  function resolve(token, stack = new Set()) {
    if (stack.has(token)) throw new Error(`Color token cycle: ${token}`);
    if (!declarations.has(token)) throw new Error(`Missing color token: ${token}`);
    const value = declarations.get(token);
    if (/^#[\da-f]{6}$/i.test(value)) return value;
    const alias = value.match(/^var\((--hw-[\w-]+)\)$/);
    if (!alias) return null;
    return resolve(alias[1], new Set([...stack, token]));
  }
  return Object.fromEntries([...declarations.keys()].sort().flatMap((token) => {
    const value = resolve(token);
    return value ? [[token, value]] : [];
  }));
}
