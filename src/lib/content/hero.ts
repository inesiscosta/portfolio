import type { DirectoryNode, FSNode } from "one-terminal";
import { BRAND_ICONS } from "#lib/content/brand-icons.ts";
import { CONTACT_HREF, SITE, SOCIAL_LINKS } from "#lib/content/site.ts";
import hero from "/src/content/hero.yaml";

/*
  The home page hero and its terminal. The words (greeting, role, tech icons, paragraphs, the terminal's welcome,
  demo, about.txt and Impossible List) live in the content repo's hero.yaml; the links and the terminal's prompt
  format stay here.
*/

export const HERO = {
  pre: hero.pre,
  name: SITE.name,
  role: hero.role,
  tech: hero.tech.map((name) => BRAND_ICONS[name]),
  body: hero.body,
  cta: {
    primary: { href: CONTACT_HREF, label: "Get in Touch" },
    secondary: { href: "/resume", label: "Resume" },
  },
  terminal: {
    username: "guest",
    hostname: SITE.handle,
    // {user}, {host}, {path} (e.g. ~/links) and {cwd} (just the last folder) follow `cd`
    title: "{user}@{host}: {path}",
    prompt: "{user}@{host}:{cwd}$",
    welcome: hero.terminal.welcome,
    demo: hero.terminal.demo,
  },
} as const;

/** "https://www.github.com/x/" → "github.com/x", for a link's label. */
const bare = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const link = (href: string, label?: string): FSNode => ({ kind: "file", fileType: "link", href, label, target: "_blank" });

export const TERMINAL_FILES: DirectoryNode = {
  kind: "directory",
  entries: {
    "about.txt": { kind: "file", fileType: "text", content: hero.terminal.about.join("\n") },
    "impossible-list.txt": {
      kind: "file",
      fileType: "text",
      content: ["Impossible List", ...hero.terminal.impossibleList.map(({ goal, done }) => `[${done ? "x" : " "}] ${goal}`)].join("\n"),
    },
    links: {
      kind: "directory",
      entries: {
        github: link(SOCIAL_LINKS.github.href, bare(SOCIAL_LINKS.github.href)),
        linkedin: link(SOCIAL_LINKS.linkedin.href, bare(SOCIAL_LINKS.linkedin.href)),
        email: link(SOCIAL_LINKS.email.href, SITE.email),
        resume: { kind: "file", fileType: "link", href: "/resume", label: "Resume", target: "_self" },
      },
    },
  },
};
