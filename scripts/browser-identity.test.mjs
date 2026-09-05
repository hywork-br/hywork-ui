import assert from "node:assert/strict";
import test from "node:test";
import { assertBrowserIdentity } from "./check-browser-identity.mjs";

test("browser identity rejects the Linux root/pwuser mismatch", () => {
  assert.throws(() => assertBrowserIdentity(0, 1000), /non-root/);
});

test("browser identity rejects a different non-root home owner", () => {
  assert.throws(() => assertBrowserIdentity(1000, 1001), /mounted home owner/);
});

test("browser identity accepts a matching non-root process and home", () => {
  assert.doesNotThrow(() => assertBrowserIdentity(1000, 1000));
});
