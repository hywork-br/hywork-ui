const SOURCE_EXTENSION = /\.[cm]?[jt]sx?$/;
const PACKAGE_IMPORT = /import\s*{([^}]+)}\s*from\s*["']@hywork\/ui["']/g;
const LOCAL_UI_IMPORT = /from\s*["'][^"']*components\/ui\//;

export function analyzeAdoption(files) {
  const sourceFiles = Object.entries(files).filter(([path]) => SOURCE_EXTENSION.test(path));
  const importedNames = new Set();
  let localUiImportFiles = 0;
  let packageImportFiles = 0;

  for (const [, source] of sourceFiles) {
    if (LOCAL_UI_IMPORT.test(source)) localUiImportFiles += 1;

    const matches = [...source.matchAll(PACKAGE_IMPORT)];
    if (matches.length === 0) continue;
    packageImportFiles += 1;

    for (const match of matches) {
      for (const rawName of match[1].split(",")) {
        const name = rawName.trim().split(/\s+as\s+/)[0];
        if (name) importedNames.add(name);
      }
    }
  }

  return {
    filesScanned: sourceFiles.length,
    localUiImportFiles,
    packageImportFiles,
    packageImportedNames: [...importedNames].sort(),
  };
}
