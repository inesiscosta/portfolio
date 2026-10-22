<!--
  Typography for a post body. The body is mdsvex output, so its elements aren't this component's own and
  every rule reaches in with :global(...) under .prose. Code blocks are Shiki output wrapped by the
  markdown pipeline (src/lib/writing/markdown.ts): .code-block > .code-lang + .code-copy + pre.shiki.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import { codeCopy } from "#lib/attachments/code-copy.ts";
  import PostBody from "#lib/components/writing/PostBody.svelte";

  let { content, justify = false }: { content: Component; justify?: boolean } = $props();
</script>

<div class="prose" class:justify {@attach codeCopy}>
  <PostBody {content} />
</div>

<style>
  .prose {
    /* Sidenotes are absolutely positioned against this column on wide screens, and numbered from here. */
    position: relative;
    counter-reset: sidenote;
    color: var(--text);
    line-height: 1.65;
  }

  /*
    Justified posts (justify: true in the frontmatter). Words are never hyphenated; long inline code can break
    after an underscore or dot instead (see breakableInlineCode in the markdown pipeline), so a line before a long
    identifier doesn't stretch. Narrow columns stay left-aligned, where justifying leaves big gaps.
  */
  .prose.justify > :global(p) {
    text-align: justify;
    hyphens: manual;
    text-wrap: pretty;
  }

  @media (max-width: 32.5rem) {
    .prose.justify > :global(p) {
      text-align: left;
    }
  }

  .prose > :global(* + *) {
    margin-top: 1.25em;
  }

  .prose :global(h2),
  .prose :global(h3) {
    color: var(--text-strong);
    font-weight: 700;
    letter-spacing: -0.02em;
    scroll-margin-top: calc(var(--header-height) + 1.5rem);
  }

  .prose :global(h2) {
    margin-top: 2.25em;
    font-size: 1.625em;
    line-height: 1.25;
  }

  .prose :global(h3) {
    margin-top: 1.75em;
    font-size: 1.25em;
    line-height: 1.3;
  }

  .prose > :global(h2:first-child) {
    margin-top: 0;
  }

  .prose :global(:is(h2, h3) + *) {
    margin-top: 0.5em;
  }

  .prose :global(a) {
    color: var(--accent-ink);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  .prose :global(a:hover) {
    text-decoration-thickness: 2px;
  }

  .prose :global(strong) {
    color: var(--text-strong);
    font-weight: 600;
  }

  .prose :global(ul),
  .prose :global(ol:not([class])) {
    padding-left: 1.25em;
  }

  .prose :global(ul) {
    list-style: disc;
  }

  .prose :global(ol:not([class])) {
    list-style: decimal;
  }

  .prose :global(li + li) {
    margin-top: 0.375em;
  }

  .prose :global(li::marker) {
    color: var(--text-subtle);
  }

  .prose :global(blockquote) {
    padding-left: 1em;
    border-left: 3px solid var(--line);
    color: var(--text-muted);
  }

  .prose :global(hr) {
    margin-block: 2.5em;
    border-top: 1px solid var(--border);
  }

  .prose :global(img) {
    height: auto;
  }

  .prose :global(:not(pre) > code) {
    padding: 0.125em 0.375em;
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text-strong);
    font-family: var(--font-mono);
    font-size: var(--font-size-mono);
  }

  .prose :global(.code-block) {
    position: relative;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-soft);
  }

  .prose :global(.code-lang) {
    position: absolute;
    top: 0.625rem;
    left: 0.75rem;
    padding: 0.0625rem 0.5rem;
    border-radius: var(--radius-full);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
  }

  .prose :global(.code-copy) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem;
    border-radius: var(--radius);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    transition:
      color 0.15s,
      background-color 0.15s;
  }

  .prose :global(.code-copy[hidden]) {
    display: none;
  }

  .prose :global(.code-copy:hover) {
    background: var(--surface);
    color: var(--text-strong);
  }

  .prose :global(.code-copy[data-copied]) {
    color: var(--success);
  }

  .prose :global(.code-copy[data-copied] svg) {
    display: none;
  }

  .prose :global(pre.shiki) {
    padding: 1rem 1.25rem 1rem 0;
    overflow-x: auto;
    background: none;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.7;
    /* `!=` and `->` stay two characters. */
    font-variant-ligatures: none;
    tab-size: 4;
    counter-reset: line;
  }

  /* Room for the language pill above the first line. */
  .prose :global(.code-lang ~ pre.shiki) {
    padding-top: 2.5rem;
  }

  .prose :global(pre.shiki code) {
    display: block;
    width: max-content;
    min-width: 100%;
  }

  .prose :global(pre.shiki .line) {
    counter-increment: line;
  }

  .prose :global(pre.shiki .line::before) {
    content: counter(line);
    display: inline-block;
    /* Wide enough for the block's longest line number (set by the markdown pipeline), never narrower than two digits. */
    width: calc(max(2, var(--line-digits, 2)) * 1ch + 1.75rem);
    padding-right: 1rem;
    color: var(--text-subtle);
    text-align: right;
    user-select: none;
  }

  /* Shiki writes both themes' colours as custom properties on each token; pick one per theme. */
  .prose :global(pre.shiki span) {
    color: var(--shiki-light);
  }

  :global(.dark) .prose :global(pre.shiki span) {
    color: var(--shiki-dark);
  }

  /*
    Shared by <Sidenote> (inline, numbered) and <MarginNote> (block, unnumbered).
    Layout adapted from Egas Ribeiro's Hugo sidenote shortcode (riogu.github.io), used with his permission.

    Narrow screens: a block in the text flow, set off by a rule. Nothing is hidden.
    Wide screens: absolutely positioned against this column with no `top`, so each note keeps its natural
    vertical position (level with the line or block it belongs to) and moves out into its margin.
  */
  .prose :global(.margin-note) {
    display: block;
    margin-block: 0.625rem;
    padding: 0.125rem 0 0.125rem 0.875rem;
    border-left: 2px solid var(--line);
    color: var(--text-muted);
    font-size: var(--font-size-note);
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
  }

  .prose :global(aside.margin-note) {
    margin-block: 1.25em;
  }

  .prose :global(.margin-note > * + *) {
    margin-top: 0.75em;
  }

  .prose :global(.margin-note pre.shiki) {
    font-size: 0.75rem;
  }

  .prose :global(.margin-note .code-lang ~ pre.shiki) {
    padding-top: 2.25rem;
  }

  @media (min-width: 80rem) {
    .prose :global(.margin-note) {
      position: absolute;
      width: var(--rail-width);
      margin: var(--side-offset, 0px) 0 0;
      padding: 0;
      border: 0;
    }

    /* More specific than the narrow-screen spacing of block notes above, so `offset` applies to them too. */
    .prose :global(aside.margin-note) {
      margin-block: var(--side-offset, 0px) 0;
    }

    /* An inline note's static position is its own line only while it's still inline, so don't make it a block here. */
    .prose :global(span.margin-note) {
      display: inline;
    }

    .prose :global(.margin-note-right) {
      left: 100%;
      margin-left: var(--rail-gap);
    }

    .prose :global(.margin-note-left) {
      right: 100%;
      margin-right: var(--rail-gap);
    }
  }

  @media print {
    .prose :global(.margin-note) {
      position: static;
      display: block;
      width: auto;
    }
  }

  .prose :global(.katex) {
    font-size: 1.05em;
  }

  .prose :global(.katex-display) {
    padding-block: 0.25em;
    overflow-x: auto;
    overflow-y: hidden;
  }
</style>
