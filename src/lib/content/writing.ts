import { SITE } from "#lib/content/site.ts";
import pages from "/src/content/pages.yaml";

export const WRITING = {
  heading: pages.writing.heading,
  intro: pages.writing.intro,
  feedTitle: `${SITE.name} — Writing`,
} as const;
