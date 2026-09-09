import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const run = (mutation, update = false, missing = false) => spawnSync("node_modules/.bin/playwright", ["test", "--project=comparator-proof", ...(update ? ["--update-snapshots=all"] : [])], {
  stdio: "inherit", env: { ...process.env, PW_GATE: missing ? "comparator-missing" : update ? "comparator-bootstrap" : mutation === "1" ? "comparator-mutated" : "comparator-restored", PW_PROOF_MUTATION: mutation, PW_PROOF_MISSING: missing ? "1" : "0" },
});
assert.equal(run("0", true).status, 0, "create disposable comparator fixture");
assert.equal(run("1").status, 1, "CSS mutation must fail with a nonzero comparator exit");
assert.equal(run("0").status, 0, "restoring the exact fixture must pass");
console.info("Comparator proof: bootstrap=0, mutation=1, restored=0. Product baselines untouched.");
const forbiddenExpected = "test-results/comparator-baselines/must-not-exist.png";
assert.equal(existsSync(forbiddenExpected), false, "missing-baseline fixture must start without expected pixels");
assert.equal(run("0", false, true).status, 1, "missing expected pixels must fail");
assert.equal(existsSync(forbiddenExpected), false, "missing-baseline run must not write expected pixels");
const candidates = readdirSync("test-results/comparator-missing", { recursive: true }).filter((path) => path.endsWith("controlled-candidate.png"));
assert.equal(candidates.length, 1, "missing-baseline failure must preserve a named full-page candidate");
const png = readFileSync(join("test-results/comparator-missing", candidates[0]));
assert.ok(png.readUInt32BE(20) > 1000, "candidate must include content below the viewport");
console.info("Missing-baseline proof: exit=1, expected absent, full-page candidate retained.");
