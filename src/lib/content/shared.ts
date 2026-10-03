/*
  Constants shared by the build-time content checks (schema.ts, yaml.ts) and the components. Keep this file free of
  zod and of content imports: vite.config.ts loads it, and the browser bundles it.
*/

/** The Lucide icons a project tag can use; ProjectTile.svelte maps each name to its component. */
export const PROJECT_ICONS = [
  "code",
  "cpu",
  "workflow",
  "flask-conical",
  "git-branch",
  "gamepad-2",
  "wrench",
  "layers",
  "globe",
  "smartphone",
] as const;
export type ProjectIcon = (typeof PROJECT_ICONS)[number];

/** The Lucide icons a timeline event can use; timeline.ts maps each name to its component. */
export const TIMELINE_ICONS = [
  "award",
  "baby",
  "bird",
  "car-front",
  "code-xml",
  "cpu",
  "crown",
  "eclipse",
  "gamepad-2",
  "graduation-cap",
  "heart",
  "map-pin",
  "mic-vocal",
  "microscope",
  "mountain-snow",
  "pickaxe",
  "plane",
  "presentation",
  "route",
  "sailboat",
  "school",
  "snowflake",
  "stamp",
  "tablet-smartphone",
  "ticket",
  "users",
  "wind",
] as const;
export type TimelineIcon = (typeof TIMELINE_ICONS)[number];

/** The Lucide icons a contact topic can use; contact.ts maps each name to its component. */
export const CONTACT_ICONS = ["briefcase", "code-xml", "coffee", "users", "mail", "heart", "rocket", "graduation-cap"] as const;
export type ContactIcon = (typeof CONTACT_ICONS)[number];
