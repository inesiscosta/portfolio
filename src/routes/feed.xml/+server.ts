/*
  Atom feed (RFC 4287) of every published post, with each post's full HTML so it reads in a feed reader.
  Prerendered: this runs once at build time.
*/

import { render } from "svelte/server";
import PostBody from "#lib/components/writing/PostBody.svelte";
import { SITE } from "#lib/content/site.ts";
import { WRITING } from "#lib/content/writing.ts";
import { postHref } from "#lib/writing/post.ts";
import { loadPostComponent, posts } from "#lib/writing/posts.server.ts";

export const prerender = true;

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function removeSpans(html: string, opening: string): string {
  let result = html;
  for (let start = result.indexOf(opening); start !== -1; start = result.indexOf(opening, start)) {
    const tag = /<span\b|<\/span>/g;
    tag.lastIndex = start;
    let depth = 0;
    let end = -1;
    for (let next = tag.exec(result); next && end === -1; next = tag.exec(result)) {
      depth += next[0] === "</span>" ? -1 : 1;
      if (depth === 0) end = tag.lastIndex;
    }
    if (end === -1) break;
    result = result.slice(0, start) + result.slice(end);
  }
  return result;
}

function feedHtml(html: string, url: string): string {
  const cleaned = removeSpans(html, '<span class="katex-html"')
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<button type="button" class="code-copy"[\s\S]*?<\/button>/g, "")
    .replace(/<span class="code-lang"[^>]*>[^<]*<\/span>/g, "");
  return cleaned
    .replace(/(href|src)="\/(?!\/)/g, `$1="${SITE.url}/`)
    .replace(/href="#/g, `href="${url}#`)
    .trim();
}

export async function GET() {
  const entries = await Promise.all(
    posts.map(async (post) => {
      const url = new URL(postHref(post.slug), SITE.url).href;
      const content = await loadPostComponent(post.slug);
      const html = content ? feedHtml(render(PostBody, { props: { content, feed: true } }).body, url) : "";
      const updated = (post.updated ?? post.date).toISOString();
      return [
        "  <entry>",
        `    <id>${url}</id>`,
        `    <title>${escapeXml(post.title)}</title>`,
        `    <link rel="alternate" type="text/html" href="${url}"/>`,
        `    <published>${post.date.toISOString()}</published>`,
        `    <updated>${updated}</updated>`,
        `    <summary>${escapeXml(post.summary)}</summary>`,
        ...post.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`),
        `    <content type="html" xml:base="${url}">${escapeXml(html)}</content>`,
        "  </entry>",
      ].join("\n");
    }),
  );

  const newest = posts.reduce((latest, post) => Math.max(latest, (post.updated ?? post.date).getTime()), 0);

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <id>${SITE.url}/writing</id>
  <title>${escapeXml(WRITING.feedTitle)}</title>
  <subtitle>${escapeXml(WRITING.intro)}</subtitle>
  <updated>${new Date(newest).toISOString()}</updated>
  <author>
    <name>${escapeXml(SITE.name)}</name>
    <uri>${SITE.url}</uri>
  </author>
  <link rel="self" type="application/atom+xml" href="${SITE.url}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE.url}/writing"/>
${entries.join("\n")}
</feed>
`;

  return new Response(xml, { headers: { "content-type": "application/atom+xml; charset=utf-8" } });
}
