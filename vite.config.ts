import { existsSync, realpathSync } from "node:fs";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

// A worktree links node_modules from the main checkout (CONTRIBUTING.md), and
// Vite serves only files under the project root: behind the link, Montserrat
// was refused and the browser tests ran on a fallback font — a label that
// breaks into two lines in Montserrat fitted in one. Allow the real folder too.
const linkedModules = existsSync("node_modules") ? [realpathSync("node_modules")] : [];

export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), ...linkedModules] } },
});
