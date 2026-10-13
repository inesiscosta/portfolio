import { SITE } from "#lib/content/site.ts";
import site from "/src/content/site.yaml";

/*
  The About text, stats and photo list live in the private content repo (src/content/about.yaml); the photos live
  in the R2 bucket at site.yaml's cloudflare.assetsUrl. about.server.ts turns the file into an About at build time. This module holds only
  the types, labels and URL helpers, so components can import it without pulling in the content.
*/

export type AboutImage = {
  /** Full URL of the photo or video. */
  src: string;
  /** Resized copies for `srcset`, when Image Transformations are on. */
  srcset?: string;
  alt: string;
  /** Optional: move the timeline to this event when the photo comes to the top of the stack. */
  event?: string;
};

export type AboutStat = { statistic: string; caption: string };

/** The About content as the components render it: photo URLs resolved and computed stats filled in. */
export type About = {
  heading: string;
  summary: string;
  paragraphs: string[];
  stats: AboutStat[];
  images: AboutImage[];
};

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

/** Image Transformations on the site's zone, switched on in site.yaml once enabled in the Cloudflare dashboard. */
const IMAGE_TRANSFORMS = site.cloudflare.imageTransforms;
const ASSETS_URL = site.cloudflare.assetsUrl;

/** The URL of a file in the R2 bucket, resized to `width` when Image Transformations are on. */
export function contentUrl(key: string, width?: number): string {
  const url = key.startsWith("https://") ? key : `${ASSETS_URL}/${key}`;
  if (!IMAGE_TRANSFORMS || width === undefined || isVideo(key)) return url;
  return `${SITE.url}/cdn-cgi/image/width=${width},format=auto,quality=82/${url}`;
}

/** A `srcset` with each width, or undefined while Image Transformations are off. */
export function contentSrcset(key: string, widths: number[]): string | undefined {
  if (!IMAGE_TRANSFORMS || isVideo(key)) return undefined;
  return widths.map((width) => `${contentUrl(key, width)} ${width}w`).join(", ");
}

export const COMMITS_STAT = {
  user: SITE.handle,
  /** Shown when GitHub can't be reached during the build. */
  fallback: "600+",
};

export const ABOUT_LABELS = {
  eyebrow: "About",
  link: { href: "/about", label: "Learn more about me" },
} as const;
