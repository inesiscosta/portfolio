import { type About, COMMITS_STAT, contentSrcset, contentUrl } from "#lib/content/about.ts";
import { age } from "#lib/content/site.ts";
import { fetchCommitCount } from "#lib/github.server.ts";
import content from "/src/content/about.yaml";

/** The photo stack is at most 540px wide; these cover it at 1x and 2x. */
const PHOTO_WIDTHS = [540, 1080];

/** The `load` for the home page and /about, run once at build time: both pages are prerendered. */
export async function loadAbout() {
  const commits = await fetchCommitCount();
  const about: About = {
    heading: content.heading,
    summary: content.summary,
    paragraphs: content.paragraphs,
    stats: content.stats.map((stat) => {
      if (!("auto" in stat)) return stat;
      if (stat.auto === "age") return { caption: stat.caption, statistic: String(age()) };
      return { caption: stat.caption, statistic: commits === null ? COMMITS_STAT.fallback : commits.toLocaleString("en") };
    }),
    images: content.images.map(({ src, alt, event }) => {
      const srcset = contentSrcset(src, PHOTO_WIDTHS);
      return { src: contentUrl(src, PHOTO_WIDTHS[0]), alt, ...(srcset ? { srcset } : {}), ...(event ? { event } : {}) };
    }),
  };
  return { about };
}
