import { existsSync } from "node:fs";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { contentStatic } from "./src/lib/content/static.ts";
import { content } from "./src/lib/content/yaml.ts";
import { markdown } from "./src/lib/writing/markdown.ts";

/** Building from example-content/ (see scripts/ensure-content.ts) rather than the real content repo. */
const example = existsSync("src/content/.example");

export default defineConfig(({ command }) => ({
  plugins: [
    content(),
    contentStatic(),
    sveltekit({
      adapter: adapter(),
      extensions: [".svelte", ".md"],
      preprocess: [markdown({ drafts: command === "serve" })],
      prerender: {
        // With an example in place, links between the real content and the real posts can have nowhere to go.
        handleHttpError: ({ path, message }) => {
          if (example && path.startsWith("/writing/")) return console.warn(`Example content: ${message}`);
          throw new Error(message);
        },
      },
    }),
  ],
  server: {
    port: 3000,
    allowedHosts: [".trycloudflare.com"],
  },
}));
