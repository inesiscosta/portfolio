import type { BrandIconData } from "#lib/content/brand-icons.ts";
import { BRAND_ICONS } from "#lib/content/brand-icons.ts";
import type { ProjectIcon } from "#lib/content/shared.ts";
import pages from "/src/content/pages.yaml";
import { homeTags, projects, tags } from "/src/content/projects.yaml";

/*
  The project tiles. The list lives in the private content repo (src/content/projects.yaml), with each `tech` entry
  named after a key of BRAND_ICONS; this module resolves those names and holds the fixed copy.
*/

export type ProjectTag = string;

/** Every tag, in filter order. */
export const PROJECT_TAGS: ProjectTag[] = tags.map((tag) => tag.name);

/** Each tag's tile icon. */
export const PROJECT_TAG_ICONS: Record<ProjectTag, ProjectIcon> = Object.fromEntries(tags.map((tag) => [tag.name, tag.icon]));

export type Project = {
  name: string;
  description: string;
  tags: ProjectTag[];
  tech: BrandIconData[];
  year: number;
  repository?: string;
  url?: string;
  link?: string;
  topics?: string[];
  image?: string;
  note?: string;
  highlight?: boolean;
};

export const HOME_FILTER_TAGS: ProjectTag[] = homeTags;

export const PROJECTS_PAGE = {
  eyebrow: "Projects",
  heading: pages.projects.heading,
  intro: pages.projects.intro,
} as const;

export const projectHref = (project: Project) => project.link ?? project.url ?? project.repository;

export const PROJECTS: Project[] = projects.map((project) => ({ ...project, tech: project.tech.map((name) => BRAND_ICONS[name]) }));
