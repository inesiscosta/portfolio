/* The link-preview image for each post: its title, date and tags. See #lib/og.server.ts. */

import { error } from "@sveltejs/kit";
import { renderOgImage } from "#lib/og.server.ts";
import { formatDate } from "#lib/writing/post.ts";
import { findPost, posts } from "#lib/writing/posts.server.ts";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => posts.map(({ slug }) => ({ slug }));

export const GET: RequestHandler = async ({ params }) => {
  const post = findPost(params.slug);
  if (!post) error(404, "Post not found");
  return renderOgImage({ eyebrow: "Writing", title: post.title, meta: formatDate(post.date), pills: post.tags });
};
