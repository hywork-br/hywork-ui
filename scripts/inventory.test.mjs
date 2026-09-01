import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeSharedComponents,
  classifySourceDifference,
} from "./lib/inventory.mjs";

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
