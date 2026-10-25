import { SITE } from "#lib/content/site.ts";

export const prerender = true;

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
