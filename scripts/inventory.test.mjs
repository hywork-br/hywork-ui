import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeSharedComponents,
  classifySourceDifference,
} from "./lib/inventory.mjs";

for (const [before, after] of [
  ["/** @jsxImportSource react */", "/** @jsxImportSource preact */"],
  ["/** @jsxRuntime automatic */", "/** @jsxRuntime classic */"],
  ["/** @jsx React.createElement */", "/** @jsx h */"],
  ["/** @jsxFrag React.Fragment */", "/** @jsxFrag Fragment */"],
  ["/** @jsxImportSource react */", ""],
]) test(`preserves compiler directive semantics: ${before}`, () => {
  assert.equal(
    classifySourceDifference(`${before}\nexport const View = <><div /></>;`, `${after}\nexport const View = <><div /></>;`),
    "api-or-behavior",
  );
});

test("ordinary comments and formatting around an unchanged JSX directive remain format-only", () => {
  assert.equal(
    classifySourceDifference(
      "/** @jsxImportSource react */\n// Original explanation\nexport const View=<div />;",
      "// Revised explanation\n\n/** @jsxImportSource react */\nexport const View = <div />;\n",
    ),
    "format-only",
  );
});

for (const [before, after] of [
  ['const city = "New York";', 'const city = "NewYork";'],
  ['function answer() { return\n42; }', 'function answer() { return 42; }'],
  ['const el = <span>New York</span>;', 'const el = <span>NewYork</span>;'],
  ['const value = `New York`;', 'const value = `NewYork`;'],
  ['let a = 1; a\n++b;', 'let a = 1; a++\nb;'],
]) test(`preserves semantic whitespace: ${JSON.stringify(before)}`, () => {
  assert.equal(classifySourceDifference(before, after), "api-or-behavior");
});

test("classifySourceDifference separates identical, formatting-only and behavioral forks", () => {
  assert.equal(
    classifySourceDifference("export const Button = 1;", "export const Button = 1;"),
    "identical",
  );
  assert.equal(
    classifySourceDifference("export const Button=1;", "export const Button = 1;\n"),
    "format-only",
  );
  assert.equal(
    classifySourceDifference("export const Button = 1;", "export const Button = 2;"),
    "api-or-behavior",
  );
});

test("analyzeSharedComponents produces a stable scorecard from two consumer inventories", () => {
  const result = analyzeSharedComponents(
    {
      "button.tsx": "export const Button=1;",
      "dialog.tsx": "export const Dialog = 'platform';",
      "only-platform.tsx": "export const Local = true;",
    },
    {
      "button.tsx": "export const Button = 1;\n",
      "dialog.tsx": "export const Dialog = 'builder';",
      "only-builder.tsx": "export const Local = true;",
    },
  );

  assert.deepEqual(result.summary, {
    platformComponents: 3,
    builderComponents: 3,
    sharedComponents: 2,
    identical: 0,
    formatOnly: 1,
    apiOrBehavior: 1,
  });
  assert.deepEqual(result.components, [
    { name: "button", difference: "format-only" },
    { name: "dialog", difference: "api-or-behavior" },
  ]);
});
