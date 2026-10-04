/*
  Vite plugin (loaded by vite.config.ts) that turns the content repo's YAML files into checked JavaScript modules.

  Each src/content/<name>.yaml is validated against SCHEMAS[name] and compiled to one named export per top-level key
  (plus a default export of the whole file), so `import { born } from "/src/content/about.yaml"` bundles only `born`.
  About photos must point at timeline events that exist, and in a build every R2 file the content names must exist:
  a missing one fails CI, and only warns on a local build (which may be offline). A project's `link` to a write-up
  must name a post that exists; while that post is a draft, builds drop the link so the tile falls back to the repo.
*/

import { readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { JSON_SCHEMA, load } from "js-yaml";
import type { Plugin } from "vite";
import { z } from "zod";
import { type AboutFile, type ProjectsFile, type ResumeFile, SCHEMAS, TimelineFile } from "#lib/content/schema.ts";

/** The R2 bucket's public URL, from site.yaml (read from disk: this runs in vite.config.ts, outside the app). */
const assetsUrl = () =>
  (
    load(readFileSync(join(process.cwd(), "src/content/site.yaml"), "utf8"), { schema: JSON_SCHEMA }) as {
      cloudflare: { assetsUrl: string };
    }
  ).cloudflare.assetsUrl;

const isSchemaName = (name: string): name is keyof typeof SCHEMAS => Object.hasOwn(SCHEMAS, name);

/** HEAD each R2 key once per build (the client and server builds both load the same files). */
const checked = new Map<string, Promise<string | null>>();
function missingFromR2(keys: string[]): Promise<(string | null)[]> {
  return Promise.all(
    keys
      .filter((key) => !key.startsWith("https://"))
      .map((key) => {
        let result = checked.get(key);
        if (!result) {
          result = fetch(`${assetsUrl()}/${key}`, { method: "HEAD" })
            .then((response) => (response.ok ? null : `${key} (${response.status})`))
            .catch((error: unknown) => `${key} (${error})`);
          checked.set(key, result);
        }
        return result;
      }),
  );
}

const isDraft = (post: string) => /^draft:\s*true\s*$/m.test(post.slice(0, post.indexOf("\n---", 3)));

function r2Keys(name: string, data: unknown): string[] {
  if (name === "about") return (data as AboutFile).images.map((image) => image.src);
  if (name === "resume") {
    const resume = data as ResumeFile;
    return [resume.portrait.src, resume.pdf];
  }
  return [];
}

export function content(): Plugin {
  let build = false;
  return {
    name: "content-yaml",
    configResolved(config) {
      build = config.command === "build";
    },
    async transform(code, id) {
      if (!id.endsWith(".yaml")) return null;
      const file = relative(process.cwd(), id);
      const name = basename(id, ".yaml");
      if (!isSchemaName(name)) this.error(`${file}: no schema for "${name}.yaml" in src/lib/content/schema.ts`);

      const result = SCHEMAS[name].safeParse(load(code, { schema: JSON_SCHEMA, filename: file }));
      if (!result.success) this.error(`Invalid ${file}:\n${z.prettifyError(result.error)}`);
      const data = result.data;

      if (name === "about") {
        // Read here rather than imported, so editing timeline.yaml re-checks about.yaml.
        const timelinePath = join(dirname(id), "timeline.yaml");
        this.addWatchFile(timelinePath);
        const timeline = TimelineFile.parse(load(readFileSync(timelinePath, "utf8"), { schema: JSON_SCHEMA }));
        const ids = new Set(timeline.events.map((event) => event.id));
        const unknown = (data as AboutFile).images.filter((image) => image.event !== undefined && !ids.has(image.event));
        if (unknown.length > 0) {
          this.error(
            `${file}: these photos point at timeline events that don't exist: ${unknown.map((i) => `${i.src} → ${i.event}`).join(", ")}`,
          );
        }
      }

      if (name === "projects") {
        for (const project of (data as ProjectsFile).projects) {
          const slug = project.link?.match(/^\/writing\/([\w-]+)$/)?.[1];
          if (!slug) continue;
          const postPath = join(process.cwd(), "src/content/writing/posts", `${slug}.md`);
          let post: string;
          try {
            post = readFileSync(postPath, "utf8");
          } catch {
            this.error(`${file}: ${project.name} links to ${project.link}, but there's no ${relative(process.cwd(), postPath)}`);
          }
          this.addWatchFile(postPath);
          if (build && isDraft(post)) delete project.link;
        }
      }

      if (build) {
        const missing = (await missingFromR2(r2Keys(name, data))).filter((key) => key !== null);
        if (missing.length > 0) {
          const message = `${file} names files that aren't in R2 (${assetsUrl()}): ${missing.join(", ")}`;
          if (process.env.CI) this.error(message);
          this.warn(message);
        }
      }

      const exports = Object.entries(data).map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`);
      exports.push(`export default { ${Object.keys(data).join(", ")} };`);
      return { code: exports.join("\n"), map: null };
    },
  };
}
