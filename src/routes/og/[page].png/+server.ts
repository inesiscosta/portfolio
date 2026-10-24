/*
  The link-preview image for each top-level page (/og/home.png, /og/about.png, ...): the page's label, heading and
  intro. Seo.svelte falls back to the home card for any page without an image of its own. See #lib/og.server.ts.
*/

import { error } from "@sveltejs/kit";
import { CV } from "#lib/content/cv.ts";
import { PROJECTS_PAGE } from "#lib/content/projects.ts";
import { SITE } from "#lib/content/site.ts";
import { WRITING } from "#lib/content/writing.ts";
import { type OgCard, renderOgImage } from "#lib/og.server.ts";
import about from "/src/content/about.yaml";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

/** Cuts long text at a word, so it fits in the card's two or three lines. */
function clip(text: string, max = 150) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).replace(/[,;:.]$/, "")}…`;
}

const CARDS: Record<string, OgCard> = {
  home: { eyebrow: `~/${SITE.handle}`, title: SITE.name, subtitle: SITE.role, meta: SITE.location },
  about: { eyebrow: "About", title: about.heading, subtitle: clip(about.summary) },
  projects: { eyebrow: "Projects", title: PROJECTS_PAGE.heading, subtitle: clip(PROJECTS_PAGE.intro) },
  writing: { eyebrow: "Writing", title: WRITING.heading, subtitle: clip(WRITING.intro) },
  resume: { eyebrow: "Resume", title: CV.header.title, subtitle: clip(CV.header.body) },
};

export const entries: EntryGenerator = () => Object.keys(CARDS).map((page) => ({ page }));

export const GET: RequestHandler = ({ params }) => {
  const card = CARDS[params.page];
  if (!card) error(404, "Not found");
  return renderOgImage(card);
};
