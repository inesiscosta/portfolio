import type { BrandIconData } from "#lib/content/brand-icons.ts";
import { BRAND_ICONS } from "#lib/content/brand-icons.ts";
import { born } from "/src/content/about.yaml";
import profile from "/src/content/profile.yaml";
import site from "/src/content/site.yaml";

/* Who the site is about (profile.yaml, and the birth time from about.yaml) and where it lives (site.yaml). */
export const SITE = {
  name: profile.name,
  handle: profile.handle,
  fullName: profile.fullName,
  role: profile.role,
  location: profile.location,
  timeZone: profile.timeZone,
  /** Birth time, from about.yaml: the About age stat and the terminal's neofetch Uptime count from it. */
  born,
  email: profile.email,
  url: site.url,
  description: profile.description,
} as const;

/** Whole years since SITE.born. */
export function age(now = new Date()) {
  const birth = new Date(SITE.born);
  const years = now.getFullYear() - birth.getFullYear();
  const birthday = new Date(birth);
  birthday.setFullYear(birth.getFullYear() + years);
  return birthday > now ? years - 1 : years;
}

export const CONTACT_HREF = "/#contact";

type SocialLink = {
  name: string;
  href: string;
  icon: BrandIconData;
};

export const SOCIAL_LINKS = {
  github: { name: "GitHub", href: profile.links.github, icon: BRAND_ICONS.github },
  linkedin: { name: "LinkedIn", href: profile.links.linkedin, icon: BRAND_ICONS.linkedin },
  email: { name: "Email", href: `mailto:${SITE.email}`, icon: BRAND_ICONS.email },
} as const satisfies Record<string, SocialLink>;

export const HOME_FOOTER = { inHero: true, atEnd: true } as const;

type NavItem = {
  href: string;
  title: string;
  /** The desktop header has a home link already (the name), so "Home" only shows on mobile. */
  desktop: boolean;
};

export function isCurrentNav(item: NavItem, pathname: string): boolean {
  if (item.href === "/writing") return pathname === "/writing" || pathname.startsWith("/writing/");
  return pathname === item.href;
}

export const NAV: NavItem[] = [
  { href: "/", title: "Home", desktop: false },
  { href: "/about", title: "About", desktop: true },
  { href: "/projects", title: "Projects", desktop: true },
  { href: "/writing", title: "Writing", desktop: true },
  { href: "/resume", title: "Resume", desktop: true },
];
