import { loadAbout } from "#lib/content/about.server.ts";
import type { PageServerLoad } from "./$types";

// Prerendered like every other page: the About content comes from the content repo at build time.
export const load: PageServerLoad = loadAbout;
