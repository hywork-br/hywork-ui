import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../storybook-static/", import.meta.url));
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };
export function serveStorybook() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error("Outside root");
      const body = await readFile(file);
      response.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
      response.end(body);
    } catch { response.writeHead(404); response.end("Not found"); }
  });
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serveStorybook().listen(6007, "127.0.0.1", () => console.info("Static Storybook http://127.0.0.1:6007"));
}
