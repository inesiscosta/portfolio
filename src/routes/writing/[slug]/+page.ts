import { error } from "@sveltejs/kit";
import type { Component } from "svelte";
import type { PageLoad } from "./$types";

// Lazy, so each post's body is its own chunk and only the one being read is downloaded.
const bodies = import.meta.glob<Component>("/src/content/writing/posts/*.md", { import: "default" });

export const load: PageLoad = async ({ data }) => {
  const body = bodies[`/src/content/writing/posts/${data.post.slug}.md`];
  if (!body) error(404, "Post not found");
  return { ...data, content: await body() };
};
