import { SITE } from "#lib/content/site.ts";
import { postHref } from "#lib/writing/post.ts";
import { posts } from "#lib/writing/posts.server.ts";

export const prerender = true;

const PAGES = ["/", "/about", "/resume", "/projects", "/writing"];

export function GET() {
  const pages = PAGES.map((path) => `  <url><loc>${new URL(path, SITE.url).href}</loc></url>`);
  const articles = posts.map(
    (post) =>
      `  <url><loc>${new URL(postHref(post.slug), SITE.url).href}</loc><lastmod>${(post.updated ?? post.date).toISOString().slice(0, 10)}</lastmod></url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...pages, ...articles].join("\n")}\n</urlset>\n`,
    {
      headers: { "content-type": "application/xml; charset=utf-8" },
    },
  );
}
