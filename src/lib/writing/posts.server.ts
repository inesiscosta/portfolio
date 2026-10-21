/*
  The one place posts are read: every Writing route, the feed, the OG images and the sitemap go through here.
*/

import type { Component } from "svelte";
import { z } from "zod";
import type { PostMeta } from "#lib/writing/post.ts";

/** A calendar day written as YYYY-MM-DD, rejected if it doesn't exist (2026-02-30). */
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected a date like 2026-10-04")
  .refine((text) => {
    const date = new Date(`${text}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
  }, "not a real date")
  .transform((text) => new Date(`${text}T00:00:00Z`));

const Frontmatter = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  date: day,
  updated: day.optional(),
  kind: z.enum(["write-up", "note"]),
  tags: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
  tldr: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  math: z.boolean().default(false),
  justify: z.boolean().default(false),
  headings: z.array(z.object({ id: z.string(), text: z.string(), depth: z.union([z.literal(2), z.literal(3)]) })),
  readingTime: z.number().int().positive(),
});

const metadata = import.meta.glob<Record<string, unknown>>("/src/content/writing/posts/*.md", { eager: true, import: "metadata" });
const components = import.meta.glob<Component>("/src/content/writing/posts/*.md", { import: "default" });

const slugOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -".md".length);

function parse(path: string, data: Record<string, unknown> | undefined): PostMeta {
  const result = Frontmatter.safeParse(data ?? {});
  if (!result.success) {
    throw new Error(`Invalid frontmatter in ${path.slice(1)}:\n${z.prettifyError(result.error)}`);
  }
  return { slug: slugOf(path), ...result.data };
}

/** Newest first. Drafts only in dev: builds compile them down to `{ draft: true }`, so there's nothing to validate. */
export const posts: PostMeta[] = Object.entries(metadata)
  .filter(([, data]) => import.meta.env.DEV || data?.draft !== true)
  .map(([path, data]) => parse(path, data))
  .sort((a, b) => b.date.getTime() - a.date.getTime());

export const findPost = (slug: string) => posts.find((post) => post.slug === slug);

export async function loadPostComponent(slug: string): Promise<Component | undefined> {
  return components[`/src/content/writing/posts/${slug}.md`]?.();
}

export function neighbours(slug: string) {
  const index = posts.findIndex((post) => post.slug === slug);
  const link = (post: PostMeta | undefined) => post && { slug: post.slug, title: post.title };
  return { newer: link(posts[index - 1]), older: link(posts[index + 1]) };
}
