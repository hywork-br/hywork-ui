import assert from "node:assert/strict";
import test from "node:test";

import { analyzeAdoption } from "./lib/adoption.mjs";

test("runtime syntax includes namespaces and reexports but excludes types and prose", () => {
  const files = {
    "default.ts": 'import UI from "@hywork/ui";',
    "namespace.ts": 'import * as UI from "@hywork/ui";',
    "named.ts": 'import { Button as Action, type ButtonProps } from "@hywork/ui";',
    "export.ts": 'export { Input as Field, type InputProps } from "@hywork/ui";',
    "star.ts": 'export * from "@hywork/ui";',
    "namespace-export.ts": 'export * as UI from "@hywork/ui";',
    "types.ts": 'import type UI from "@hywork/ui"; import type { Button } from "@hywork/ui"; export type * from "@hywork/ui"; export type { Input } from "@hywork/ui"; import { type Avatar } from "@hywork/ui";',
    "prose.ts": '// import { Fake } from "@hywork/ui";\n/* export * from "@hywork/ui"; */\nconst prose = `import { Fake } from "@hywork/ui"; from "@/components/ui/fake"`; ',
    "local.ts": 'import * as UI from "@/components/ui/button"; export { Dialog } from "@/components/ui/dialog";',
    "local-types.ts": 'import type { Button } from "@/components/ui/button";',
  };
  assert.deepEqual(analyzeAdoption(files), {
    filesScanned: 10, localUiImportFiles: 1, packageImportFiles: 6,
    packageImportedNames: ["*", "Button", "Input", "default"],
  });
  assert.deepEqual(analyzeAdoption(Object.fromEntries(Object.entries(files).reverse())), analyzeAdoption(files));
});

test("analyzeAdoption counts package and local UI imports without rewriting source", () => {
  const files = {
    "app/page.tsx": [
      'import { Button, ListPage } from "@hywork/ui";',
      'import { Dialog } from "@/components/ui/dialog";',
    ].join("\n"),
    "app/other.tsx": 'import { Input } from "@hywork/ui";',
    "README.md": 'import { Fake } from "@hywork/ui";',
  };

  assert.deepEqual(analyzeAdoption(files), {
    filesScanned: 2,
    localUiImportFiles: 1,
    packageImportFiles: 2,
    packageImportedNames: ["Button", "Input", "ListPage"],
  });
});
