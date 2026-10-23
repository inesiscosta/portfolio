<!--
  Numbered margin note, used inline right after the word it annotates:  word<Sidenote>note</Sidenote>
  For a longer, unnumbered note with block content (code, lists, images) use <MarginNote>.

  Adapted from Egas Ribeiro's Hugo sidenote shortcode (https://riogu.github.io), used with his permission.

  It renders inline elements only, because mdsvex wraps it in the paragraph's <p>: a marker after the word,
  then the note with its own copy of the marker. Numbering is a CSS counter (reset by the post's prose
  column), so it works prerendered and without JS. Placement in the margins is shared with MarginNote and
  lives in Prose.svelte. `offset` nudges a note down (or up, negative) when two collide.

  Keep the markup on one line: any whitespace between the word, the marker and the note would show.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getPostRender, hasPostRender } from "#lib/writing/context.ts";

  let { side = "right", offset = "0px", children }: { side?: "left" | "right"; offset?: string; children: Snippet } = $props();

  const feed = hasPostRender() && getPostRender().feed;
</script>

{#if feed}<small> ({@render children()})</small>{:else}<sup class="sidenote-marker sidenote-ref" aria-hidden="true" data-pagefind-ignore></sup><span class="sidenote margin-note margin-note-{side}" style:--side-offset={offset}><sup class="sidenote-marker" aria-hidden="true" data-pagefind-ignore></sup><span class="sr-only">Sidenote: </span>{@render children()}</span>{/if}

<style>
  /* Sidenote numbering adapted from Egas Ribeiro's Hugo shortcode (riogu.github.io), used with his permission. */

  .sidenote-marker {
    margin-left: 0.0625rem;
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 0.7em;
    font-weight: 500;
    line-height: 0;
  }

  .sidenote-ref {
    counter-increment: sidenote;
  }

  .sidenote-ref::after {
    content: counter(sidenote);
  }

  /* The note's copy shows the same number: the counter was already incremented by the reference. */
  .sidenote > .sidenote-marker {
    margin: 0 0.375rem 0 0;
  }

  .sidenote > .sidenote-marker::before {
    content: counter(sidenote);
  }
</style>
