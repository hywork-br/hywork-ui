import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("../", import.meta.url).pathname);
const roots = ["README.md", "CONTRIBUTING.md", "governance", "migration", "specs"];

async function markdownFiles(target) {
  const absolute = path.join(root, target);
  if (target.endsWith(".md")) return [absolute];
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const relative = path.join(target, entry.name);
      if (entry.isDirectory()) return markdownFiles(relative);
      return entry.name.endsWith(".md") ? [path.join(root, relative)] : [];
    }),
  );
  return nested.flat();
}

test("relative Markdown links resolve to repository artifacts", async () => {
  const files = (await Promise.all(roots.map(markdownFiles))).flat();
  const broken = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = match[1].split("#")[0];
      if (!href || /^(https?:|mailto:)/.test(href)) continue;
      const target = path.resolve(path.dirname(file), decodeURIComponent(href));
      try {
        await access(target);
      } catch {
        broken.push(`${path.relative(root, file)} -> ${href}`);
      }
    }
  }

  assert.deepEqual(broken, []);
});
