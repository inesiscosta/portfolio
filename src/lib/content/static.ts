/*
  Vite plugin (loaded by vite.config.ts) that serves the content repo's static/ folder at the site root, alongside
  this repo's own static/: project screenshots, and the files posts load at runtime (a web worker, a data file, a
  binary an emulator runs). In dev the files are answered from src/content/static; a build emits them into the client
  output, which the adapter publishes as they are. A file with the same path as one in this repo's static/ is an error.
*/

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import type { Plugin } from "vite";

const DIR = "src/content/static";

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".pdf": "application/pdf",
};

/** Paths under DIR, with forward slashes. */
function files(): string[] {
  if (!existsSync(DIR)) return [];
  return (readdirSync(DIR, { recursive: true }) as string[])
    .filter((path) => statSync(join(DIR, path)).isFile() && !path.split(sep).some((part) => part.startsWith(".")))
    .map((path) => path.split(sep).join("/"));
}

export function contentStatic(): Plugin {
  return {
    name: "content-static",
    buildStart() {
      const clashes = files().filter((path) => existsSync(join("static", path)));
      if (clashes.length > 0) this.error(`${DIR} and static/ both have: ${clashes.join(", ")}`);
    },
    configureServer(server) {
      const root = resolve(DIR);
      server.middlewares.use((request, response, next) => {
        const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
        const file = resolve(root, `.${path}`);
        if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) return next();
        response.setHeader("Content-Type", TYPES[extname(file).toLowerCase()] ?? "application/octet-stream");
        response.end(readFileSync(file));
      });
    },
    generateBundle() {
      if (this.environment.name !== "client") return;
      for (const path of files()) this.emitFile({ type: "asset", fileName: path, source: readFileSync(join(DIR, path)) });
    },
  };
}
