/*
  Runs before `pnpm dev` and `pnpm build`. This repo is the site's engine; what it shows comes from a content repo
  cloned into src/content (gitignored here): the profile, hero, about, timeline, resume, projects and page copy, and
  writing/ with the posts and any components, standalone pages and static files they need.

  Without it, example-content/ is copied in, so anyone can clone and build this repo, and a `.example` marker is left
  in it. Deploys set REQUIRE_CONTENT=1: there, a missing content repo or an example copy is an error, never a site
  full of placeholder text. Then it writes wrangler.jsonc from site.yaml.
*/

import { cpSync, existsSync, writeFileSync } from "node:fs";
import { writeWranglerConfig } from "./site-config.ts";

const CONTENT = "src/content";
const isExample = existsSync(`${CONTENT}/.example`);

if (process.env.REQUIRE_CONTENT === "1" && (isExample || !existsSync(`${CONTENT}/about.yaml`))) {
  console.error(`${CONTENT} ${isExample ? "holds the example" : "is missing"}: the deploy needs the content repo checked out there.`);
  process.exit(1);
}

if (!existsSync(`${CONTENT}/about.yaml`)) {
  cpSync("example-content", CONTENT, { recursive: true });
  // vite.config.ts reads this marker.
  writeFileSync(`${CONTENT}/.example`, "");
  console.log(`No content repo in ${CONTENT}: using example-content/ instead.`);
}

writeWranglerConfig();
