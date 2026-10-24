/*
  1200×630 link-preview images (Open Graph), the card WhatsApp, iMessage, Slack, LinkedIn and X show for a shared link.
  Satori lays out the HTML template with real font files and resvg turns the SVG into a PNG. Only prerendered routes
  call this, so it only ever runs in Node at build time; the native resvg binary is imported lazily and never reaches
  the Worker.

  Satori reads TTF/OTF/WOFF (not WOFF2), so the fonts come from @fontsource's .woff files. Characters those fonts lack
  (a Japanese title, say) are drawn with Noto Sans JP, fetched from Google Fonts for just the characters needed.
  Colours mirror the light theme tokens in src/app.css.
*/

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SITE } from "#lib/content/site.ts";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const COLOURS = {
  bg: "#f7f7f4",
  heading: "#202938",
  muted: "#5f6e84",
  accentInk: "#0f6f99",
  tagBg: "#e0eef5",
  gradient: "linear-gradient(90deg, #1ea3d6, #168fc3, #1b6fa8)",
};

export type OgCard = {
  /** The small mono label at the top: a page name (shown in capitals) or a ~/handle (shown as written). */
  eyebrow: string;
  title: string;
  /** A line or two under the title. */
  subtitle?: string;
  /** Text before the pills on the bottom row, e.g. a date. */
  meta?: string;
  /** Pills on the bottom row, e.g. tags. */
  pills?: string[];
};

const font = (path: string) => readFile(resolve("node_modules/@fontsource", path));

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A font for text none of the bundled fonts cover, fetched for just those characters; none if offline. */
async function fallbackFont(text: string): Promise<ArrayBuffer | undefined> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@800&text=${encodeURIComponent(text)}`, {
        // An old user agent gets TrueType, which Satori reads, rather than WOFF2.
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

export async function renderOgImage(card: OgCard): Promise<Response> {
  const [{ default: satori }, { html }, { Resvg }, inter400, inter800, mono400, mono500] = await Promise.all([
    import("satori"),
    import("satori-html"),
    import("@resvg/resvg-js"),
    font("inter/files/inter-latin-400-normal.woff"),
    font("inter/files/inter-latin-800-normal.woff"),
    font("jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff"),
    font("jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"),
  ]);

  // Long titles step down so they stay within three lines.
  const titleSize = card.title.length > 70 ? 56 : 68;
  const pills = (card.pills ?? [])
    .map(
      (pill) =>
        `<span style="padding: 6px 16px; border-radius: 999px; background: ${COLOURS.tagBg}; color: ${COLOURS.accentInk};">${escapeHtml(pill)}</span>`,
    )
    .join("");
  const bottomRow =
    card.meta || pills
      ? `<div style="display: flex; align-items: center; gap: 12px; font-family: JetBrains Mono; font-size: 22px; color: ${COLOURS.muted};">
          ${card.meta ? `<span style="margin-right: 12px;">${escapeHtml(card.meta)}</span>` : ""}${pills}
        </div>`
      : "";

  const markup = html(`
    <div style="display: flex; flex-direction: column; width: ${OG_WIDTH}px; height: ${OG_HEIGHT}px; background: ${COLOURS.bg}; font-family: Inter;">
      <div style="display: flex; height: 10px; background: ${COLOURS.gradient};"></div>
      <div style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; padding: 64px 80px 60px;">
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; font-family: JetBrains Mono; font-weight: 500; font-size: 24px; letter-spacing: 3px; color: ${COLOURS.accentInk};">${escapeHtml(card.eyebrow.startsWith("~/") ? card.eyebrow : card.eyebrow.toUpperCase())}</div>
          <div style="display: flex; margin-top: 28px; font-size: ${titleSize}px; font-weight: 800; line-height: 1.1; letter-spacing: -2px; color: ${COLOURS.heading};">${escapeHtml(card.title)}</div>
          ${card.subtitle ? `<div style="display: flex; margin-top: 24px; font-size: 30px; line-height: 1.4; color: ${COLOURS.muted};">${escapeHtml(card.subtitle)}</div>` : ""}
        </div>
        <div style="display: flex; flex-direction: column; gap: 28px;">
          ${bottomRow}
          <div style="display: flex; align-items: baseline; gap: 16px; font-size: 28px;">
            <span style="font-weight: 800; letter-spacing: -0.5px; color: ${COLOURS.heading};">${escapeHtml(SITE.name)}</span>
            <span style="font-family: JetBrains Mono; font-size: 22px; color: ${COLOURS.muted};">${new URL(SITE.url).host}</span>
          </div>
        </div>
      </div>
    </div>
  `);

  const fonts = [
    { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: inter800, weight: 800 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono400, weight: 400 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono500, weight: 500 as const, style: "normal" as const },
  ];
  // Anything outside Latin (and its punctuation) needs the fallback font.
  const unusual = [
    ...new Set(`${card.title}${card.subtitle ?? ""}`.replace(/[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu, "")),
  ].join("");
  const fallback = unusual ? await fallbackFont(unusual) : undefined;
  if (fallback) fonts.push({ name: "Noto Sans JP", data: Buffer.from(fallback), weight: 800, style: "normal" });

  const svg = await satori(markup as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png" } });
}
