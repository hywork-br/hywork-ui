import assert from "node:assert/strict";
import test from "node:test";

import { analyzeAdoption } from "./lib/adoption.mjs";

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
