import { error } from "@sveltejs/kit";
import { findPost, neighbours, posts } from "#lib/writing/posts.server.ts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = () => posts.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
  const post = findPost(params.slug);
  if (!post) error(404, "Post not found");
  return { post, ...neighbours(post.slug) };
};
