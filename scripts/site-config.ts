/*
  Reads the content repo's site.yaml (where the site lives) and writes the wrangler.jsonc that Wrangler deploys from.
  wrangler.jsonc is generated, not committed: the Worker name, account and domain belong to whoever uses the template.
*/

import { readFileSync, writeFileSync } from "node:fs";
import { JSON_SCHEMA, load } from "js-yaml";

export type SiteConfig = {
  url: string;
  aliases?: string[];
  cloudflare: { accountId: string; worker: string; bucket: string; assetsUrl: string; imageTransforms: boolean };
};

export function readYaml<T>(path: string): T {
  return load(readFileSync(path, "utf8"), { schema: JSON_SCHEMA, filename: path }) as T;
}

export const readSite = () => readYaml<SiteConfig>("src/content/site.yaml");

/** The engine's own Worker settings; the rest comes from site.yaml. */
export function writeWranglerConfig(site = readSite()) {
  const config = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: site.cloudflare.worker,
    account_id: site.cloudflare.accountId,
    main: ".svelte-kit/cloudflare/_worker.js",
    assets: { binding: "ASSETS", directory: ".svelte-kit/cloudflare" },
    compatibility_date: "2026-10-01",
    compatibility_flags: ["nodejs_compat"],
    observability: { enabled: true },
    // Every hostname is listed: a deploy detaches custom domains its config doesn't name.
    routes: [new URL(site.url).host, ...(site.aliases ?? [])].map((pattern) => ({ pattern, custom_domain: true })),
  };
  writeFileSync(
    "wrangler.jsonc",
    `// Generated from src/content/site.yaml by scripts/site-config.ts before every dev run and build: edit those, not this.\n${JSON.stringify(config, null, 2)}\n`,
  );
}
