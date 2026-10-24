<script lang="ts">
  import type { Snippet } from "svelte";
  import { getPostRender, hasPostRender } from "#lib/writing/context.ts";

  let { caption, children }: { caption: string; children?: Snippet } = $props();

  // Numbered in render order, so "[Figure 1](#figure-1)" links work without JS and in the feed.
  const number = hasPostRender() ? ++getPostRender().figures : 1;
</script>

<figure id="figure-{number}" class="figure">
  {#if children}
    <div class="figure-body">{@render children()}</div>
  {/if}
  <figcaption>Figure {number}: {caption}</figcaption>
</figure>

<style>
  .figure {
    margin-block: 2rem;
    scroll-margin-top: calc(var(--header-height) + 1.5rem);
  }

  .figure-body {
    overflow-x: auto;
  }

  .figure-body :global(img) {
    border-radius: var(--radius-lg);
  }

  figcaption {
    margin-top: 0.75rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-style: italic;
    text-align: center;
  }
</style>
