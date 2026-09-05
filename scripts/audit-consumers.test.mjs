import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function createConsumerFixture(name, files) {
  const root = mkdtempSync(join(tmpdir(), `${name}-`));
  execFileSync("git", ["init", "-b", "main"], { cwd: root });

  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(root, path);
    mkdirSync(join(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, content);
  }

  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync(
    "git",
    [
      "-c",
      "user.name=Hywork UI Tests",
      "-c",
      "user.email=ui-tests@hywork.invalid",
      "commit",
      "-m",
      "fixture",
    ],
    { cwd: root },
  );
  return root;
}

test("audit-consumers measures shared components and real import files", () => {
  const platform = createConsumerFixture("platform", {
    "src/components/ui/button.tsx": "export const Button=1;",
    "src/components/ui/dialog.tsx": "export const Dialog='platform';",
    "src/page.tsx": 'import { Button } from "@/components/ui/button";\nvoid Button;',
  });
  const builder = createConsumerFixture("builder", {
    "components/ui/button.tsx": "export const Button = 1;\n",
    "components/ui/dialog.tsx": "export const Dialog='builder';",
    "app/page.tsx": 'import { Button } from "@/components/ui/button";\nvoid Button;',
  });

  const stdout = execFileSync(
    process.execPath,
    [
      "scripts/audit-consumers.mjs",
      "--platform-repo",
      platform,
      "--builder-repo",
      builder,
      "--platform-ref",
      "HEAD",
      "--builder-ref",
      "HEAD",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  const result = JSON.parse(stdout);

  assert.deepEqual(result.summary, {
    platformComponents: 2,
    builderComponents: 2,
    sharedComponents: 2,
    identical: 0,
    formatOnly: 1,
    apiOrBehavior: 1,
  });
  assert.deepEqual(
    result.components.map(({ name, difference, platformImports, builderImports }) => ({
      name,
      difference,
      platformImports,
      builderImports,
    })),
    [
      {
        name: "button",
        difference: "format-only",
        platformImports: 1,
        builderImports: 1,
      },
      {
        name: "dialog",
        difference: "api-or-behavior",
        platformImports: 0,
        builderImports: 0,
      },
    ],
  );
});

test("audit-consumers writes the scorecard when --output is provided", () => {
  const platform = createConsumerFixture("platform-output", {
    "src/components/ui/button.tsx": "export const Button=1;",
  });
  const builder = createConsumerFixture("builder-output", {
    "components/ui/button.tsx": "export const Button=1;",
  });
  const output = join(mkdtempSync(join(tmpdir(), "scorecard-")), "baseline.json");

  execFileSync(
    process.execPath,
    [
      "scripts/audit-consumers.mjs",
      "--platform-repo",
      platform,
      "--builder-repo",
      builder,
      "--platform-ref",
      "HEAD",
      "--builder-ref",
      "HEAD",
      "--output",
      output,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  const result = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(result.summary.sharedComponents, 1);
  assert.equal(result.components[0].name, "button");
});
