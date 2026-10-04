/*
  Types for the content repo's YAML files (src/content/*.yaml), which src/lib/content/yaml.ts checks and compiles to
  one named export per top-level key. A script file (no top-level import or export) so the wildcards are ambient.
*/

declare module "*/about.yaml" {
  const data: import("#lib/content/schema.ts").AboutFile;
  export default data;
  export const born: string;
}

declare module "*/timeline.yaml" {
  export const events: import("#lib/content/schema.ts").TimelineFile["events"];
}

declare module "*/resume.yaml" {
  const data: import("#lib/content/schema.ts").ResumeFile;
  export default data;
}

declare module "*/projects.yaml" {
  export const tags: import("#lib/content/schema.ts").ProjectsFile["tags"];
  export const homeTags: import("#lib/content/schema.ts").ProjectsFile["homeTags"];
  export const projects: import("#lib/content/schema.ts").ProjectsFile["projects"];
}

declare module "*/profile.yaml" {
  const data: import("#lib/content/schema.ts").ProfileFile;
  export default data;
}

declare module "*/hero.yaml" {
  const data: import("#lib/content/schema.ts").HeroFile;
  export default data;
}

declare module "*/site.yaml" {
  const data: import("#lib/content/schema.ts").SiteFile;
  export default data;
}

declare module "*/pages.yaml" {
  const data: import("#lib/content/schema.ts").PagesFile;
  export default data;
}
