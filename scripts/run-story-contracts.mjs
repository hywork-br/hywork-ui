import { spawn } from "node:child_process";
import { serveStorybook } from "./serve-storybook.mjs";

const server = serveStorybook();
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(6007, "127.0.0.1", resolve); });
const child = spawn("node_modules/.bin/test-storybook", ["--url", "http://127.0.0.1:6007", "--browsers", "chromium", "firefox", "--maxWorkers", "1", ...process.argv.slice(2)], { stdio: "inherit" });
const stop = () => child.kill("SIGTERM");
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
child.once("error", (error) => { console.error(error); process.exitCode = 1; server.close(); });
child.once("exit", (code) => { process.exitCode = code ?? 1; server.close(); });
