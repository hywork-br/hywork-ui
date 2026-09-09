import ts from "typescript";

function normalizedSyntax(source) {
  const tree = ts.createSourceFile("component.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // Invalid/unsupported syntax cannot establish formatting equivalence.
  if (tree.parseDiagnostics.length) return null;
  // JSX pragmas are comments syntactically, but select the emitted runtime and
  // factory. Preserve their parsed arguments (and repeated-directive order),
  // excluding source positions so ordinary comment/layout edits remain cosmetic.
  const jsxPragmas = [...tree.pragmas]
    .filter(([name]) => ["jsx", "jsxfrag", "jsximportsource", "jsxruntime"].includes(name))
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([name, entries]) => [
      name,
      (Array.isArray(entries) ? entries : [entries]).map((entry) => entry.arguments),
    ]);
  const syntax = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed }).printFile(tree);
  return JSON.stringify({ jsxPragmas, syntax });
}

export function classifySourceDifference(platformSource, builderSource) {
  if (platformSource === builderSource) return "identical";
  const platformSyntax = normalizedSyntax(platformSource);
  if (platformSyntax !== null && platformSyntax === normalizedSyntax(builderSource)) {
    return "format-only";
  }
  return "api-or-behavior";
}

export function analyzeSharedComponents(platformFiles, builderFiles) {
  const sharedNames = Object.keys(platformFiles)
    .filter((name) => Object.hasOwn(builderFiles, name))
    .sort();

  const components = sharedNames.map((filename) => ({
    name: filename.replace(/\.tsx$/u, ""),
    difference: classifySourceDifference(
      platformFiles[filename],
      builderFiles[filename],
    ),
  }));

  return {
    summary: {
      platformComponents: Object.keys(platformFiles).length,
      builderComponents: Object.keys(builderFiles).length,
      sharedComponents: components.length,
      identical: components.filter(({ difference }) => difference === "identical").length,
      formatOnly: components.filter(({ difference }) => difference === "format-only").length,
      apiOrBehavior: components.filter(
        ({ difference }) => difference === "api-or-behavior",
      ).length,
    },
    components,
  };
}
