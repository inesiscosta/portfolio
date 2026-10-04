/*
  The shape of each YAML file in the content repo (src/content/*.yaml). yaml.ts checks every file against its schema
  when Vite loads it, so a mistake fails `pnpm dev` and the build with a readable error instead of reaching the site.
  Build-time only: components import the inferred types with `import type`, never the schemas, so zod stays out of
  the browser bundle.
*/

import { z } from "zod";
import { BRAND_ICONS } from "#lib/content/brand-icons.ts";
import { CONTACT_ICONS, PROJECT_ICONS, TIMELINE_ICONS } from "#lib/content/shared.ts";

const text = z.string().min(1);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected a date like 2026-10-04");
const month = z.string().regex(/^\d{4}-\d{2}$/, "expected a month like 2026-10");
/** A key in the R2 bucket, like "photos/sailing.3f9a1c2b.webp" (`pnpm photo:add` prints it), or a full URL. */
const r2Key = z.string().regex(/^(https:\/\/|[a-z0-9][a-z0-9/._-]*$)/, "expected an R2 key like photos/sailing.3f9a1c2b.webp");
const focus = text;
const brandIcon = z.enum(Object.keys(BRAND_ICONS) as [keyof typeof BRAND_ICONS, ...(keyof typeof BRAND_ICONS)[]]);

export const AboutFile = z.strictObject({
  /** Birth time with its UTC offset: the age stat and the terminal's neofetch Uptime count from it. */
  born: z.iso.datetime({ offset: true }),
  heading: text,
  summary: text,
  paragraphs: z.array(text),
  stats: z.array(
    z.union([z.strictObject({ statistic: text, caption: text }), z.strictObject({ auto: z.enum(["age", "commits"]), caption: text })]),
  ),
  images: z.array(z.strictObject({ src: r2Key, alt: text, event: text.optional() })),
});
export type AboutFile = z.infer<typeof AboutFile>;

export const TimelineFile = z.strictObject({
  events: z.array(z.strictObject({ id: text, date: day, heading: text, description: text, icon: z.enum(TIMELINE_ICONS) })),
});
export type TimelineFile = z.infer<typeof TimelineFile>;

const CvPoint = z.strictObject({
  text,
  /** The focus areas this point speaks to. */
  focus: z.array(focus).optional(),
  /** Rewordings that lead with one focus's angle, used when exactly one of this point's focuses is selected. */
  as: z.partialRecord(focus, text).optional(),
});

const CvRole = z.strictObject({
  title: text,
  from: month,
  /** null while ongoing. */
  to: month.nullable(),
  points: z.array(CvPoint),
  skills: z.array(text).optional(),
  /** Shown as a pill beside the title, e.g. "GPA: 18.2 / 20". */
  grade: text.optional(),
});

/** One organisation; several roles there are listed under it, newest first. */
const CvEntry = z.strictObject({ organization: text, location: text, roles: z.array(CvRole) });

export const ResumeFile = z
  .strictObject({
    /** The angles the resume can be tailored to; picking some rewords and reorders the points to lead with them. */
    focuses: z.array(text).min(1),
    portrait: z.strictObject({ src: r2Key, alt: text }),
    /** The PDF in the R2 bucket that "Download PDF" links to (`pnpm cv:push` uploads it). */
    pdf: r2Key,
    experience: z.array(CvEntry),
    education: z.array(CvEntry),
    skills: z.array(z.strictObject({ group: text, items: z.array(text) })),
    /** Which focus areas a skill belongs to, so a tailored resume lists the relevant ones first. */
    skillFocus: z.record(text, z.array(focus)),
    volunteering: z.array(z.strictObject({ name: text, description: text })),
  })
  .superRefine((resume, context) => {
    const known = new Set(resume.focuses);
    const used = [
      ...[...resume.experience, ...resume.education].flatMap((entry) =>
        entry.roles.flatMap((role) => role.points.flatMap((point) => [...(point.focus ?? []), ...Object.keys(point.as ?? {})])),
      ),
      ...Object.values(resume.skillFocus).flat(),
    ];
    const unknown = [...new Set(used.filter((name) => !known.has(name)))];
    if (unknown.length > 0) context.addIssue({ code: "custom", message: `focus areas not listed in \`focuses\`: ${unknown.join(", ")}` });
  });
export type ResumeFile = z.infer<typeof ResumeFile>;

export const ProjectsFile = z
  .strictObject({
    /** The tags projects can have, each with its tile icon, in the order the filters list them. */
    tags: z.array(z.strictObject({ name: text, icon: z.enum(PROJECT_ICONS) })).min(1),
    /** The tags offered as filters on the home page (the projects page offers them all). */
    homeTags: z.array(text),
    projects: z.array(
      z.strictObject({
        name: text,
        description: text,
        /** Names from `tags` above. */
        tags: z.array(text),
        /** Names from BRAND_ICONS in brand-icons.ts. */
        tech: z.array(brandIcon),
        year: z.number().int(),
        repository: z.url().optional(),
        url: z.url().optional(),
        /** A page on this site, e.g. the write-up. */
        link: z.string().startsWith("/").optional(),
        topics: z.array(text).optional(),
        /** A screenshot: a path under the content repo's static/, e.g. /images/projects/site.webp. */
        image: z.string().startsWith("/").optional(),
        note: text.optional(),
        highlight: z.boolean().optional(),
      }),
    ),
  })
  .superRefine((file, context) => {
    const known = new Set(file.tags.map((tag) => tag.name));
    const used = [...file.homeTags, ...file.projects.flatMap((project) => project.tags)];
    const unknown = [...new Set(used.filter((name) => !known.has(name)))];
    if (unknown.length > 0) context.addIssue({ code: "custom", message: `tags not listed in \`tags\`: ${unknown.join(", ")}` });
  });
export type ProjectsFile = z.infer<typeof ProjectsFile>;

export const SiteFile = z.strictObject({
  /** The canonical URL; feed entry ids are built from it, so change it with care. */
  url: z.url({ protocol: /^https$/ }),
  /**
   * Other hostnames attached to the Worker alongside `url`'s, e.g. www.example.com. Pair each with a redirect rule
   * to `url` in the Cloudflare dashboard; attaching it keeps its DNS record, which the rule needs to fire.
   */
  aliases: z.array(z.string().regex(/^[a-z0-9.-]+$/, "expected a hostname like www.example.com")).default([]),
  cloudflare: z.strictObject({
    accountId: z.string().regex(/^[0-9a-f]{32}$/, "expected a 32-character Cloudflare account ID"),
    worker: z.string().regex(/^[a-z0-9-]+$/, "expected a Worker name: lowercase letters, digits and dashes"),
    bucket: z.string().regex(/^[a-z0-9-]+$/, "expected an R2 bucket name"),
    assetsUrl: z.url({ protocol: /^https$/ }),
    imageTransforms: z.boolean(),
  }),
});
export type SiteFile = z.infer<typeof SiteFile>;

export const ProfileFile = z.strictObject({
  name: text,
  fullName: text,
  /** GitHub username. */
  handle: z.string().regex(/^[A-Za-z0-9-]+$/, "expected a GitHub username"),
  role: text,
  location: text,
  timeZone: text.refine(
    (zone) => Intl.supportedValuesOf("timeZone").includes(zone) || zone === "UTC",
    "expected an IANA time zone like Europe/Berlin",
  ),
  email: z.email(),
  description: text,
  links: z.strictObject({ github: z.url(), linkedin: z.url() }),
});
export type ProfileFile = z.infer<typeof ProfileFile>;

export const HeroFile = z.strictObject({
  pre: text,
  role: text,
  /** Names from BRAND_ICONS in brand-icons.ts. */
  tech: z.array(brandIcon),
  body: z.array(text),
  terminal: z.strictObject({
    welcome: text,
    demo: z.array(text),
    /** The lines of about.txt. */
    about: z.array(text),
    impossibleList: z.array(z.strictObject({ goal: text, done: z.boolean() })),
  }),
});
export type HeroFile = z.infer<typeof HeroFile>;

const PageIntro = z.strictObject({ heading: text, intro: text });

export const PagesFile = z.strictObject({
  projects: PageIntro,
  writing: PageIntro,
  resume: PageIntro,
  contact: z.strictObject({
    heading: text,
    highlight: text,
    body: text,
    topics: z.array(z.strictObject({ label: text, icon: z.enum(CONTACT_ICONS) })),
  }),
});
export type PagesFile = z.infer<typeof PagesFile>;

/** Each YAML file in the content repo, by file name. */
export const SCHEMAS = {
  site: SiteFile,
  pages: PagesFile,
  profile: ProfileFile,
  hero: HeroFile,
  about: AboutFile,
  timeline: TimelineFile,
  resume: ResumeFile,
  projects: ProjectsFile,
} as const;
