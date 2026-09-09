import ts from "typescript";

const SOURCE_EXTENSION = /\.[cm]?[jt]sx?$/;

// Names refer to the package export, not its local alias. A namespace/star is
// represented by "*"; default by "default". Type-only declarations do not adopt UI.
function runtimeBindings(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (!clause) return []; // Side-effect import still executes the module.
    if (clause.isTypeOnly) return null;
    const names = clause.name ? ["default"] : [];
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) names.push("*");
      else names.push(...clause.namedBindings.elements.filter((item) => !item.isTypeOnly).map((item) => (item.propertyName ?? item.name).text));
    }
    return names.length || !clause.namedBindings?.elements?.length ? names : null;
  }
  if (node.isTypeOnly) return null;
  if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) return ["*"];
  const names = node.exportClause.elements.filter((item) => !item.isTypeOnly).map((item) => (item.propertyName ?? item.name).text);
  return names.length || !node.exportClause.elements.length ? names : null;
}

export function analyzeAdoption(files) {
  const sourceFiles = Object.entries(files).filter(([path]) => SOURCE_EXTENSION.test(path));
  const importedNames = new Set();
  let localUiImportFiles = 0;
  let packageImportFiles = 0;

  for (const [file, source] of sourceFiles) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    let packageUsed = false, localUsed = false;
    for (const node of tree.statements) {
      if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const names = runtimeBindings(node);
      if (names === null) continue;
      const moduleName = node.moduleSpecifier.text;
      if (moduleName.includes("components/ui/")) localUsed = true;
      if (moduleName !== "@hywork/ui") continue;
      packageUsed = true;
      names.forEach((name) => importedNames.add(name));
    }
    if (packageUsed) packageImportFiles += 1;
    if (localUsed) localUiImportFiles += 1;
  }

  return {
    filesScanned: sourceFiles.length,
    localUiImportFiles,
    packageImportFiles,
    packageImportedNames: [...importedNames].sort(),
  };
}
