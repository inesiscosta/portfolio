/*
  Puts files in the R2 bucket the site reads photos and the CV from, so they never enter a git repo.

    pnpm photo:add <file> [name]   strip metadata (EXIF, GPS), convert to WebP, upload as photos/<name>.<hash>.webp
    pnpm photo:rm <key>            delete a photo, once no content file mentions it any more
    pnpm cv:push <pdf>             replace the CV PDF (fixed key, so links to it keep working)

  Photo keys carry a hash of their bytes, so they're cached for a year: a changed photo is a new key, never a stale
  copy. The bucket and its URL come from site.yaml, and the CV's key from resume.yaml's `pdf`. Run from the site repo
  with Wrangler logged in to the account in site.yaml (`pnpm exec wrangler whoami`).
*/

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { readSite, readYaml, writeWranglerConfig } from "./site-config.ts";

const CONTENT_DIR = "src/content";
const site = readSite();
const BUCKET = site.cloudflare.bucket;
const CONTENT_URL = site.cloudflare.assetsUrl;
/** The CV's key in the bucket: resume.yaml's `pdf`. */
const CV_KEY = readYaml<{ pdf: string }>(`${CONTENT_DIR}/resume.yaml`).pdf;
const IMMUTABLE = "public, max-age=31536000, immutable";

// Wrangler finds the account in wrangler.jsonc.
writeWranglerConfig(site);

function wrangler(...args: string[]) {
  execFileSync("node_modules/.bin/wrangler", [...args, "--remote"], { stdio: ["ignore", "ignore", "inherit"] });
}

function put(key: string, file: string, contentType: string, cacheControl: string, extra: string[] = []) {
  wrangler(
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    "--file",
    file,
    "--content-type",
    contentType,
    "--cache-control",
    cacheControl,
    ...extra,
  );
  console.log(`Uploaded ${CONTENT_URL}/${key}`);
}

const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function addPhoto(file: string, name = slugify(basename(file, extname(file)))) {
  if (!name) throw new Error("Give the photo a name: pnpm photo:add <file> <name>");
  // rotate() bakes in the EXIF orientation before the metadata is dropped (sharp drops it unless told to keep it).
  const webp = await sharp(file)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const key = `photos/${name}.${createHash("sha256").update(webp).digest("hex").slice(0, 8)}.webp`;
  const dir = mkdtempSync(join(tmpdir(), "photo-"));
  try {
    const out = join(dir, "photo.webp");
    writeFileSync(out, webp);
    put(key, out, "image/webp", IMMUTABLE);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(`\nAdd it to src/content/about.yaml under images:\n  - src: ${key}\n    alt: <what's in the photo>`);
}

function removePhoto(key: string) {
  const users = readdirSync(CONTENT_DIR).filter(
    (file) => file.endsWith(".yaml") && readFileSync(join(CONTENT_DIR, file), "utf8").includes(key),
  );
  if (users.length > 0) throw new Error(`${key} is still used in ${users.join(", ")}: remove it there first.`);
  wrangler("r2", "object", "delete", `${BUCKET}/${key}`);
  console.log(`Deleted ${key}`);
}

function pushCv(file: string) {
  if (extname(file).toLowerCase() !== ".pdf") throw new Error(`${file} isn't a PDF`);
  // An hour's cache: the key never changes, so a new CV has to replace the old one in caches reasonably soon.
  put(CV_KEY, file, "application/pdf", "public, max-age=3600", ["--content-disposition", `attachment; filename="${CV_KEY}"`]);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "photo:add" && args[0]) await addPhoto(args[0], args[1]);
  else if (command === "photo:rm" && args[0]) removePhoto(args[0]);
  else if (command === "cv:push" && args[0]) pushCv(args[0]);
  else throw new Error("Usage: pnpm photo:add <file> [name] | pnpm photo:rm <key> | pnpm cv:push <pdf>");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
