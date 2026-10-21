/*
  Build-time markdown pipeline for posts (src/content/writing/posts/*.md), loaded by vite.config.ts.
*/

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSON_SCHEMA, load as loadYaml } from "js-yaml";
import { escapeSvelte, mdsvex } from "mdsvex";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import { createHighlighter, type Highlighter } from "shiki";

const WORDS_PER_MINUTE = 230;
/** The content repo's static files, served at the site root (see src/lib/content/static.ts). */
const WRITING_STATIC = "src/content/static";

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type VFileLike = { data: unknown };

function classList(node: HastNode): string[] {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.map(String) : [];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: HastNode, enter: (node: HastNode, parent: HastNode | null) => boolean | undefined, parent: HastNode | null = null) {
  if (enter(node, parent) === false) return;
  for (const child of node.children ?? []) walk(child, enter, node);
}

const LANGS = ["python", "typescript", "javascript", "rust", "c", "cpp", "bash", "shell", "json", "yaml", "svelte", "html", "css", "sql"];

let highlighter: Promise<Highlighter> | undefined;

// Lucide "copy" icon. This string is emitted at build time, so it can't be the @lucide/svelte component.
const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

/**
 * A fence whose meta names a file and a function (```python file=examples/fib.py def=fib) is filled
 * at build time with that function, cut from the file in the content repo's static/, so the post can't drift from the code it
 * runs. Line numbers continue from where the function starts in the file.
 */
function sourceExcerpt(meta: string | null | undefined): { code: string; start: number; file: string } | undefined {
  const file = /\bfile=(\S+)/.exec(meta ?? "")?.[1];
  const def = /\bdef=(\S+)/.exec(meta ?? "")?.[1];
  if (!file || !def) return undefined;
  const lines = readFileSync(resolve(WRITING_STATIC, file), "utf8").split("\n");
  const head = new RegExp(`^\\s*def ${def.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\(`);
  const first = lines.findIndex((line) => head.test(line));
  if (first < 0) throw new Error(`${WRITING_STATIC}/${file} has no "def ${def}("`);
  const indentOf = (line: string) => line.length - line.trimStart().length;
  const indent = indentOf(lines[first] ?? "");
  let end = first + 1;
  while (end < lines.length && (!lines[end]?.trim() || indentOf(lines[end] ?? "") > indent)) end++;
  while (end > first + 1 && !lines[end - 1]?.trim()) end--;
  return {
    code: lines
      .slice(first, end)
      .map((line) => line.slice(indent))
      .join("\n"),
    start: first + 1,
    file: file.slice(file.lastIndexOf("/") + 1),
  };
}

async function highlight(code: string, lang: string | null | undefined, meta?: string | null): Promise<string> {
  highlighter ??= createHighlighter({ themes: ["github-light", "github-dark"], langs: LANGS });
  const shiki = await highlighter;
  const language = lang && shiki.getLoadedLanguages().includes(lang) ? lang : "text";
  const excerpt = sourceExcerpt(meta);

  const html = shiki.codeToHtml((excerpt?.code ?? code).replace(/\n$/, ""), {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    // Prose numbers lines with a CSS counter: an excerpt starts it at the function's first line, and --line-digits
    // (the widest line number's length) sizes the number column so three-digit numbers keep their breathing room.
    transformers: [
      {
        pre: (node) => {
          const first = excerpt?.start ?? 1;
          const lineCount = (excerpt?.code ?? code).replace(/\n$/, "").split("\n").length;
          const reset = excerpt ? `counter-reset: line ${first - 1};` : "";
          node.properties.style = `${node.properties.style ?? ""};${reset}--line-digits: ${String(first + lineCount - 1).length}`;
        },
      },
    ],
  });

  const name = excerpt?.file ?? lang;
  const label = name ? `<span class="code-lang" data-pagefind-ignore>${name}</span>` : "";
  const button = `<button type="button" class="code-copy" hidden data-pagefind-ignore aria-label="Copy code">${COPY_ICON}<span class="code-copied" aria-live="polite"></span></button>`;
  const block = `<div class="code-block">${label}${button}${html}</div>`;

  return `{@html \`${escapeSvelte(block)}\`}`;
}

function collectPostData() {
  return (root: unknown, file: VFileLike) => {
    const tree = root as HastNode;
    const headings: { id: string; text: string; depth: 2 | 3 }[] = [];
    let words = 0;

    walk(tree, (node) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const id = node.properties?.id;
        if (typeof id === "string") headings.push({ id, text: textOf(node).trim(), depth: node.tagName === "h2" ? 2 : 3 });
      }
      if (node.type === "element" && classList(node).includes("katex")) {
        words += 1;
        return false;
      }
      if (node.type === "text") words += (node.value ?? "").split(/\s+/).filter(Boolean).length;
      return undefined;
    });

    const data = file.data as { fm?: Record<string, unknown> };
    data.fm ??= {};
    data.fm.headings = headings;
    data.fm.readingTime = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  };
}

function svelteSafeBraces() {
  return (root: unknown) => {
    walk(root as HastNode, (node) => {
      if (node.type !== "element" || !classList(node).includes("katex")) return undefined;
      walk(node, (inner) => {
        if (inner.type === "text" && inner.value && /[{}]/.test(inner.value)) {
          inner.type = "raw";
          inner.value = inner.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
        }
        return undefined;
      });
      return false;
    });
  };
}

/** Lets long inline code (`_connected_to_other_tetromino_shape`) wrap after an underscore or a dot, never mid-word. */
function breakableInlineCode() {
  return (root: unknown) => {
    walk(root as HastNode, (node, parent) => {
      if (node.type !== "element" || node.tagName !== "code") return undefined;
      if (parent?.type === "element" && parent.tagName === "pre") return false;
      node.children = (node.children ?? []).flatMap((child): HastNode[] => {
        if (child.type !== "text" || !child.value) return [child];
        return child.value.split(/(?<=\w[_.])(?=\w)/).flatMap((part, i) =>
          i
            ? [
                { type: "element", tagName: "wbr", properties: {}, children: [] },
                { type: "text", value: part },
              ]
            : [{ type: "text", value: part }],
        );
      });
      return false;
    });
  };
}

function stripDrafts() {
  return (root: unknown, file: VFileLike) => {
    const data = file.data as { fm?: Record<string, unknown> };
    if (data.fm?.draft !== true) return;
    data.fm = { draft: true };
    (root as HastNode).children = [];
  };
}

export const markdown = ({ drafts }: { drafts: boolean }) =>
  mdsvex({
    extensions: [".md"],
    frontmatter: {
      type: "yaml",
      marker: "-",
      parse: (source) => loadYaml(source, { schema: JSON_SCHEMA }) as Record<string, unknown>,
    },
    highlight: { highlighter: highlight },
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeSlug,
      [rehypeKatex, { output: "htmlAndMathml" }],
      svelteSafeBraces,
      breakableInlineCode,
      collectPostData,
      ...(drafts ? [] : [stripDrafts]),
    ],
  });
