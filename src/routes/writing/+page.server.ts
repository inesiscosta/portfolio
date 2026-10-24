import { posts } from "#lib/writing/posts.server.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({ posts });
