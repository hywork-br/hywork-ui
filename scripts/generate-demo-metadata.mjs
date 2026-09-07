import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function fail(message) {
  throw new Error(message);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  }
  return result.stdout.trim();
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function packHash(root) {
  const destination = mkdtempSync(join(tmpdir(), "hywork-demo-pack-"));
  try {
    const output = run(
      "npm",
      ["pack", root, "--ignore-scripts", "--pack-destination", destination, "--json"],
      { cwd: root },
    );
    let filename;
    try {
      [{ filename }] = JSON.parse(output);
    } catch (error) {
      fail(`npm pack returned unreadable JSON: ${error.message}`);
    }
    if (!filename) fail("npm pack did not report an artifact filename");
    return sha256(join(destination, filename));
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
}

function readPackage(root) {
  try {
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  } catch (error) {
    fail(`package.json is unreadable: ${error.message}`);
  }
}

function parseOptions(argv) {
  let root = process.cwd();
  let output;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--root") {
      root = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--output") {
      output = argv[index + 1];
      index += 1;
    } else {
      fail(`unknown argument: ${argv[index]}`);
    }
  }
  if (!root) fail("--root requires a directory");
  root = resolve(root);
  output = resolve(output ?? join(root, ".storybook", "static", "design-system.json"));
  return { output, root };
}

export function generateDemoMetadata({ output, root }) {
  const packageJson = readPackage(root);
  if (packageJson.name !== "@hywork/ui") fail("package name must be @hywork/ui");
  if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(packageJson.version ?? "")) {
    fail("package version is invalid");
  }

  const sourceCommit = run("git", ["rev-parse", "HEAD"], { cwd: root });
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) fail("Git HEAD is not a full commit SHA");
  const clean = run("git", ["status", "--porcelain", "--untracked-files=normal"], {
    cwd: root,
  }) === "";
  const artifactSha256 = packHash(root);

  const metadata = {
    schemaVersion: 1,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    sourceCommit,
    artifactSha256,
    clean,
  };
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(metadata, null, 2)}\n`);
  return metadata;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = parseOptions(process.argv.slice(2));
    const metadata = generateDemoMetadata(options);
    console.log(
      `[demo-metadata] wrote ${options.output} for ${metadata.packageName} ${metadata.packageVersion} (${metadata.sourceCommit}, ${metadata.artifactSha256}, clean=${metadata.clean})`,
    );
  } catch (error) {
    console.error(`[demo-metadata] ${error.message}`);
    process.exitCode = 1;
  }
}
