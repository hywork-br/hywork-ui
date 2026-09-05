import assert from "node:assert/strict";
import { loadCsf } from "storybook/internal/csf-tools";

/** Registered contracts use CSF3 object stories and inline function expressions.
 * A play may be inherited from inline meta. Dynamic/spread/imported expressions
 * require explicit support and tests; fail closed instead of guessing execution. */
export function assertStoryContract(source, entry) {
  const csf = loadCsf(source, { fileName: entry.storyFile, makeTitle: (title) => title }).parse();
  assert.ok(csf._stories[entry.storyExport], `${entry.slug} story export must exist`);
  assert.ok(["play", "smoke"].includes(entry.storyContract), `${entry.slug} needs an explicit story contract kind`);
  if (entry.status === "draft") assert.equal(entry.storyContract, "play", `${entry.slug} draft contract requires play`);
  if (entry.storyContract === "smoke") return;

  const story = csf.getStoryExport(entry.storyExport);
  assert.equal(story.type, "ObjectExpression", `${entry.slug} play contract requires supported CSF3 object syntax`);
  assert.ok(!story.properties.some((property) => property.type === "SpreadElement"), `${entry.slug} play contract cannot resolve story spreads`);
  const own = csf._storyAnnotations[entry.storyExport];
  const hasOwnPlay = Object.hasOwn(own, "play");
  if (!hasOwnPlay) assert.ok(!csf._metaNode?.properties.some((property) => property.type === "SpreadElement"), `${entry.slug} play contract cannot resolve meta spreads`);
  const play = hasOwnPlay ? own.play : csf._metaAnnotations.play;
  const callable = play && (["ArrowFunctionExpression", "FunctionExpression"].includes(play.type)
    || (play.type === "ObjectMethod" && play.kind === "method"));
  assert.ok(callable, `${entry.slug} needs a callable play (direct or inherited from meta)`);
}
