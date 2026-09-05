import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const run = (mutation, update = false) => spawnSync("node_modules/.bin/playwright", ["test", "--project=comparator-proof", ...(update ? ["--update-snapshots=all"] : [])], {
  stdio: "inherit", env: { ...process.env, PW_GATE: update ? "comparator-bootstrap" : mutation === "1" ? "comparator-mutated" : "comparator-restored", PW_PROOF_MUTATION: mutation },
});
assert.equal(run("0", true).status, 0, "create disposable comparator fixture");
assert.equal(run("1").status, 1, "CSS mutation must fail with a nonzero comparator exit");
assert.equal(run("0").status, 0, "restoring the exact fixture must pass");
console.info("Comparator proof: bootstrap=0, mutation=1, restored=0. Product baselines untouched.");
