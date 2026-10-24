/*
  Runs after `vite build` (see package.json). Replaces each page's text preview card with a screenshot of the page
  itself: the hero for the home page, the reading layout for a post. Headless Chrome opens every built page at
  1200×630, the size link previews use, and the requests for the site's own URLs are answered from the build output,
  so no server runs and the pictures match what deploys. Without Chrome the text cards from #lib/og.server.ts stay.

  Chrome is found through CHROME_PATH or the usual install locations (GitHub's Ubuntu runners have it).
*/

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { readSite } from "./site-config.ts";

const OUT = ".svelte-kit/cloudflare";
const WIDTH = 1200;
const HEIGHT = 630;

const CHROMES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
};

/** Each built page and the preview image it points at (the paths Seo.svelte and the og routes use). */
function targets(): { path: string; image: string }[] {
  const pages = [
    { path: "/", image: "og/home.png" },
    ...["about", "projects", "writing", "resume"].map((page) => ({ path: `/${page}`, image: `og/${page}.png` })),
  ];
  const posts = existsSync(join(OUT, "writing"))
    ? readdirSync(join(OUT, "writing"))
        .filter((file) => file.endsWith(".html"))
        .map((file) => file.slice(0, -".html".length))
        .map((slug) => ({ path: `/writing/${slug}`, image: `writing/${slug}/og.png` }))
    : [];
  return [...pages, ...posts].filter(({ image }) => existsSync(join(OUT, image)));
}

/** The file in the build output a site path is served from, as the Worker's static assets would. */
function fileFor(pathname: string): string | undefined {
  const path = decodeURIComponent(pathname);
  const candidates = path.endsWith("/") ? [`${path}index.html`, `${path.slice(0, -1)}.html`] : [path, `${path}.html`, `${path}/index.html`];
  return candidates.map((candidate) => join(OUT, candidate)).find((file) => existsSync(file) && statSync(file).isFile());
}

async function main() {
  const chrome = CHROMES.find((path) => path && existsSync(path));
  if (!chrome) {
    console.warn("og-screenshots: no Chrome found (set CHROME_PATH); keeping the text preview cards.");
    return;
  }
  const site = new URL(readSite().url).origin;
  const pages = targets();
  const profile = mkdtempSync(join(tmpdir(), "og-chrome-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const browser = spawn(chrome, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-sandbox",
    "about:blank",
  ]);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    let target: { webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 75 && !target; i++) {
      await sleep(200);
      try {
        const list = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
        target = list.find((entry) => entry.type === "page");
      } catch {}
    }
    if (!target) throw new Error("Chrome didn't start");

    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve) => socket.addEventListener("open", resolve));
    let id = 0;
    const pending = new Map<number, (message: { result?: Record<string, unknown> }) => void>();
    const send = (method: string, params: Record<string, unknown> = {}) =>
      new Promise<{ result?: Record<string, unknown> }>((resolve) => {
        const next = ++id;
        pending.set(next, resolve);
        socket.send(JSON.stringify({ id: next, method, params }));
      });

    // Requests for the site's own URLs come from the build output; anything else (photos, fonts) goes to the network.
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) return pending.get(message.id)?.(message);
      if (message.method !== "Fetch.requestPaused") return;
      const { requestId, request } = message.params as { requestId: string; request: { url: string } };
      const url = new URL(request.url);
      if (url.origin !== site) return void send("Fetch.continueRequest", { requestId });
      const file = fileFor(url.pathname);
      if (!file) return void send("Fetch.fulfillRequest", { requestId, responseCode: 404, body: "" });
      void send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: TYPES[extname(file)] ?? "application/octet-stream" }],
        body: readFileSync(file).toString("base64"),
      });
    });

    await send("Fetch.enable", { patterns: [{ urlPattern: `${site}/*` }] });
    await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
    for (const { path, image } of pages) {
      await send("Page.navigate", { url: `${site}${path}` });
      // Long enough for fonts, photos and the entrance animations to settle.
      await sleep(path === "/" ? 3500 : 2500);
      const shot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(OUT, image), Buffer.from(String(shot.result?.data), "base64"));
    }
    socket.close();
    console.log(`og-screenshots: ${pages.length} link-preview images from screenshots`);
  } finally {
    browser.kill();
    rmSync(profile, { recursive: true, force: true });
  }
}

await main();
