/*
  Standalone pages: src/content/writing/pages/<path>.svelte is served at /<path>, for things a post
  links to that need a page of their own (an app, a full-screen demo). Routes in this repo take precedence.
*/

import { error } from "@sveltejs/kit";
import type { Component } from "svelte";
import type { EntryGenerator, PageLoad } from "./$types";

const ROOT = "/src/content/writing/pages/";
const pages = import.meta.glob<Component>("/src/content/writing/pages/**/*.svelte", { import: "default" });

/** Every page, so the prerenderer builds them even if nothing links to them. */
export const entries: EntryGenerator = () => Object.keys(pages).map((file) => ({ page: file.slice(ROOT.length, -".svelte".length) }));

export const load: PageLoad = async ({ params }) => {
  const page = pages[`${ROOT}${params.page}.svelte`];
  if (!page) error(404, "Not found");
  return { component: await page() };
};
