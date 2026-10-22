<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Rss from "@lucide/svelte/icons/rss";
  import katexCss from "katex/dist/katex.min.css?url";
  import { giveWay } from "#lib/attachments/give-way.ts";
  import { scrollspy } from "#lib/attachments/scrollspy.ts";
  import Seo from "#lib/components/Seo.svelte";
  import BackToTop from "#lib/components/writing/BackToTop.svelte";
  import Prose from "#lib/components/writing/Prose.svelte";
  import TagList from "#lib/components/writing/TagList.svelte";
  import TldrBox from "#lib/components/writing/TldrBox.svelte";
  import Toc from "#lib/components/writing/Toc.svelte";
  import { formatDate, isoDay, postHref } from "#lib/writing/post.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const post = $derived(data.post);
  // A post with only a heading or two doesn't need a table of contents; its left margin is then free for sidenotes.
  const hasToc = $derived(post.headings.length >= 2);

  let active = $state<string | undefined>();
  let layout = $state<HTMLElement>();
  // True while a left margin note is level with the TOC; the TOC slides out of its way until it has passed.
  let tucked = $state(false);

  /** Where notes leave the text for the margins; matches the 80rem breakpoint below. */
  const WIDE = "(min-width: 80rem)";
</script>

<Seo
  title={post.title}
  description={post.summary}
  image="{postHref(post.slug)}/og.png"
  article={{ published: post.date, modified: post.updated, tags: post.tags }}
/>

<svelte:head>
  {#if post.math}
    <link rel="stylesheet" href={katexCss} />
  {/if}
</svelte:head>

{#snippet backLink()}
  <a class="back" href="/writing"><ArrowLeft size={16} aria-hidden="true" /> All posts</a>
{/snippet}

<div class="layout" class:has-toc={hasToc} bind:this={layout}>
  {#if hasToc}
    <!-- The aside holds the TOC's place and is what's measured; the inner block is what moves. -->
    <aside class="toc-rail" data-pagefind-ignore {@attach giveWay(() => layout, ".margin-note-left", WIDE, (value) => (tucked = value))}>
      <div class="toc-inner" class:tucked inert={tucked}>
        {@render backLink()}
        <nav aria-labelledby="toc-label">
          <p id="toc-label" class="eyebrow-mono toc-label">Table of contents</p>
          <Toc headings={post.headings} {active} />
        </nav>
      </div>
    </aside>
  {/if}

  {#key post.slug}
    <article class="article" data-pagefind-body data-pagefind-meta="kind:{post.kind}">
      <header class="post-header">
        <div class="narrow-only" data-pagefind-ignore>{@render backLink()}</div>
        <div class="meta">
          <time class="date" datetime={isoDay(post.date)} data-pagefind-meta="date">{formatDate(post.date)}</time>
          <span class="dot" aria-hidden="true">·</span>
          <span class="date">{post.readingTime} min read</span>
          {#if post.draft}
            <span class="draft">Draft</span>
          {/if}
          <TagList tags={post.tags} />
        </div>
        <div class="title-block">
          <h1 data-pagefind-meta="title">{post.title}</h1>
          {#if post.subtitle}
            <p class="subtitle">{post.subtitle}</p>
          {/if}
          {#if post.tldr}
            <div class="tldr">
              <TldrBox text={post.tldr} />
            </div>
          {/if}
        </div>
        {#if post.updated}
          <p class="updated">Updated <time datetime={isoDay(post.updated)}>{formatDate(post.updated)}</time></p>
        {/if}
      </header>

      {#if hasToc}
        <details class="toc-details narrow-only" data-pagefind-ignore>
          <summary class="eyebrow-mono">Table of contents</summary>
          <Toc headings={post.headings} {active} />
        </details>
      {/if}

      <div class="body" {@attach scrollspy((id) => (active = id))}>
        <Prose content={data.content} justify={post.justify} />
      </div>

      <footer class="post-footer" data-pagefind-ignore>
        {#if data.older || data.newer}
          <nav class="pager" aria-label="More posts">
            {#if data.older}
              <a class="older" href={postHref(data.older.slug)}>
                <span class="eyebrow-mono"><ArrowLeft size={12} aria-hidden="true" /> Previous</span>
                {data.older.title}
              </a>
            {/if}
            {#if data.newer}
              <a class="newer" href={postHref(data.newer.slug)}>
                <span class="eyebrow-mono">Next <ArrowRight size={12} aria-hidden="true" /></span>
                {data.newer.title}
              </a>
            {/if}
          </nav>
        {/if}
        <a class="feed" href="/feed.xml"><Rss size={14} aria-hidden="true" /> Subscribe via Atom feed</a>
      </footer>
    </article>
  {/key}
</div>

<BackToTop />

<style>
  /*
    Columns, narrow to wide:
      < 80rem   one column; the TOC is a <details> above the body and every note is inline.
      ≥ 80rem   TOC | article | right margin. Left notes share the TOC's column: while one is level with
                the sticky TOC, the TOC slides out of the way (see giveWay) and comes back after.
    Posts without a TOC get article | margin either side.
    Notes and the TL;DR are positioned against the article using --rail-width and --rail-gap, so they land
    in the margin columns as long as those columns use the same tokens.
  */
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    max-width: calc(var(--prose-measure) + 2 * var(--gutter));
    margin-inline: auto;
    padding: 2.5rem var(--gutter) var(--page-bottom);
    font-size: 1.0625rem;
  }

  @media (min-width: 80rem) {
    .layout {
      grid-template-columns: var(--rail-width) minmax(0, var(--prose-measure)) var(--rail-width);
      justify-content: center;
      column-gap: var(--rail-gap);
      max-width: none;
      padding-top: 3.5rem;
      font-size: 1.125rem;
    }

    .layout.has-toc {
      grid-template-columns: var(--toc-width) minmax(0, var(--prose-measure)) var(--rail-width);
    }

    /* Always the second-to-last column, whichever layout is in use. */
    .article {
      grid-column: -3;
    }

    .toc-rail {
      grid-column: 1;
      grid-row: 1;
    }

    .narrow-only {
      display: none;
    }
  }

  /* Left notes fit the TOC's column exactly. */
  @media (min-width: 80rem) {
    .has-toc :global(.margin-note-left) {
      width: var(--toc-width);
    }
  }

  .toc-rail {
    display: none;
  }

  @media (min-width: 80rem) {
    .toc-rail {
      position: sticky;
      top: calc(var(--header-height) + 2rem);
      display: block;
      align-self: start;
      font-size: 1rem;
    }
  }

  .toc-inner {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: calc(100vh - var(--header-height) - 4rem);
    overflow-y: auto;
    transition:
      translate 0.35s var(--ease),
      opacity 0.25s var(--ease);
  }

  /* Out of the way of a left margin note: slid off to the left and faded, then back when it has passed. */
  .toc-inner.tucked {
    translate: calc(-100% - var(--rail-gap)) 0;
    opacity: 0;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .toc-inner {
      transition: opacity 0.2s linear;
    }

    .toc-inner.tucked {
      translate: none;
    }
  }

  .toc-label {
    margin-bottom: 0.75rem;
    color: var(--text-muted);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    transition: color 0.15s;
  }

  .back:hover {
    color: var(--text-strong);
  }

  .toc-details {
    margin-bottom: 2.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    font-size: 1rem;
  }

  .toc-details summary {
    color: var(--text-muted);
    cursor: pointer;
  }

  .toc-details[open] summary {
    margin-bottom: 0.75rem;
  }

  .post-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    color: var(--text-muted);
  }

  .date,
  .updated {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .updated {
    color: var(--text-muted);
  }

  .dot {
    margin-inline: -0.25rem;
  }

  .draft {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
    background: var(--surface);
    color: var(--danger);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  /* The TL;DR's containing block on wide screens, so it lines up with the title. */
  .title-block {
    position: relative;
  }

  h1 {
    color: var(--text-strong);
    font-size: clamp(2rem, 1.4rem + 2.2vw, 2.75rem);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.03em;
    text-wrap: balance;
    /* Japanese has no spaces, so keep each run of it whole instead of breaking between characters. */
    word-break: keep-all;
  }

  .subtitle {
    margin-top: 0.75rem;
    color: var(--text-muted);
    font-size: 1.1875em;
    line-height: 1.5;
  }

  .tldr {
    margin-top: 1.5rem;
  }

  @media (min-width: 80rem) {
    .tldr {
      position: absolute;
      top: 0;
      left: 100%;
      width: var(--rail-width);
      margin: 0 0 0 var(--rail-gap);
    }
  }

  .post-footer {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .pager {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .pager {
      grid-template-columns: 1fr 1fr;
    }
  }

  .pager a {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-strong);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.35;
    transition: border-color 0.2s var(--ease);
  }

  .pager a:hover {
    border-color: var(--accent);
  }

  .pager .eyebrow-mono {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pager .newer {
    grid-column: -2;
    align-items: flex-end;
    text-align: right;
  }

  .feed {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    transition: color 0.15s;
  }

  .feed:hover {
    color: var(--accent-ink);
  }
</style>
