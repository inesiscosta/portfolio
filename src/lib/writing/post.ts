/*
  Post types and display helpers shared by the server loader and the Writing components.
*/

export type Heading = { id: string; text: string; depth: 2 | 3 };

type PostKind = "write-up" | "note";

export type PostMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  date: Date;
  updated?: Date;
  kind: PostKind;
  tags: string[];
  summary: string;
  tldr?: string;
  featured: boolean;
  draft: boolean;
  math: boolean;
  /** Justified body text (no hyphenation; long inline code may break after `_` or `.`). */
  justify: boolean;
  headings: Heading[];
  readingTime: number;
};

export const postHref = (slug: string) => `/writing/${slug}`;

const KIND_LABEL: Record<PostKind, string> = { "write-up": "Technical write-up", note: "Note" };

export function postEyebrow(post: Pick<PostMeta, "kind" | "featured" | "draft">): string {
  return [post.draft && "Draft", post.featured && "Featured", KIND_LABEL[post.kind]].filter(Boolean).join(" · ");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export const isoDay = (date: Date) => date.toISOString().slice(0, 10);
