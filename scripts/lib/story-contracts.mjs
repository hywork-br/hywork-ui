import assert from "node:assert/strict";
import { loadCsf } from "storybook/internal/csf-tools";

const hasUnresolvedProperties = (node) => node.properties.some((property) =>
  !["ObjectProperty", "ObjectMethod"].includes(property.type) || property.computed
  || !["Identifier", "StringLiteral"].includes(property.key?.type));

// Read validated AST properties in runtime order; CSF annotations omit quoted keys.
const lastPlayProperty = (node) => node.properties.findLast((property) =>
  (property.key.type === "Identifier" ? property.key.name : property.key.value) === "play");

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
  assert.ok(!hasUnresolvedProperties(story), `${entry.slug} play contract cannot resolve story properties (spreads/computed keys)`);
  let property = lastPlayProperty(story);
  if (!property) {
    assert.ok(csf._metaNode && !hasUnresolvedProperties(csf._metaNode), `${entry.slug} play contract cannot resolve meta properties (spreads/computed keys)`);
    property = lastPlayProperty(csf._metaNode);
  }
  const play = property?.type === "ObjectMethod" ? property : property?.value;
  const callable = play && !play.generator && (["ArrowFunctionExpression", "FunctionExpression"].includes(play.type)
    || (play.type === "ObjectMethod" && play.kind === "method"));
  assert.ok(callable, `${entry.slug} needs a callable play (direct or inherited from meta)`);
}
