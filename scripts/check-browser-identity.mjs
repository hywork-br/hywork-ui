import assert from "node:assert/strict";
import { accessSync, constants, statSync } from "node:fs";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

export function assertBrowserIdentity(uid, homeOwnerUid) {
  assert.ok(Number.isInteger(uid) && uid > 0, "Browser CI must run as a non-root user (pwuser)");
  assert.equal(uid, homeOwnerUid, "Browser process uid must match the mounted home owner");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const uid = process.getuid();
  const homeOwnerUid = statSync(homedir()).uid;
  assertBrowserIdentity(uid, homeOwnerUid);
  accessSync(homedir(), constants.W_OK);
  accessSync(process.cwd(), constants.W_OK);
  console.info(`Browser identity verified: uid=${uid}, home owner=${homeOwnerUid}; home and workspace writable.`);
}
