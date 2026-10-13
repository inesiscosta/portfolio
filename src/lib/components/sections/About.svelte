<script lang="ts">
  import type { Snippet } from "svelte";
  import PhotoStack from "#lib/components/sections/PhotoStack.svelte";
  import type { About } from "#lib/content/about.ts";

  /** Built from the content repo's about.yaml by about.server.ts. */
  let { about, heading }: { about: About; heading?: Snippet } = $props();
</script>

<section id="about" class="about" data-pagefind-body data-pagefind-meta="title:About">
  <div class="container">
    {#if heading}
      <!-- The page's PageHeader, passed in by /about so it lines up with every other page. -->
      {@render heading()}
    {/if}
    <div class="layout" class:with-photos={about.images.length > 0}>
      {#if about.images.length > 0}
        <PhotoStack images={about.images} />
      {/if}
      <div class="text">
        <dl class="stats">
          {#each about.stats as stat (stat.caption)}
            <div class="stat">
              <dt>{stat.caption}</dt>
              <dd>{stat.statistic}</dd>
            </div>
          {/each}
        </dl>
        <div class="description">
          {#each about.paragraphs as paragraph, index (index)}
            <p>{paragraph}</p>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Clipped sideways only, so photos flicked off the stack leave the window without a sideways scrollbar,
     while the tilted cards' corners can still hang below the section instead of being cut off. */
  .about {
    overflow-x: clip;
    scroll-margin-top: var(--header-height);
  }

  .layout {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 36rem;
  }

  /* Number over caption, like the stats in the home page's About strip. */
  .stat {
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 0.125rem;
    user-select: none;
  }

  dd {
    color: var(--accent-ink);
    font-size: 1.875rem;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.05em;
  }

  dt {
    color: var(--text-subtle);
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  /* Justified, with hyphenation so lines don't open wide gaps between words (<html lang="en"> picks the
     dictionary); `pretty` avoids a lone word on a paragraph's last line. */
  .description {
    max-width: 52rem;
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
    text-align: justify;
    hyphens: auto;
    text-wrap: pretty;
  }

  .description p + p {
    margin-top: 0.625rem;
  }

  @media (min-width: 640px) {
    .stats {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1024px) {
    /* Photos large on the left, text and stats beside them, both starting at the top. */
    .layout.with-photos {
      display: grid;
      /* The photos take whatever height the window leaves after the heading, timeline and footer (~38rem), so the
         page fits without scrolling; 18rem to 28rem wide (4:3). */
      grid-template-columns: clamp(18rem, (100svh - 38rem) * 4 / 3, 28rem) minmax(0, 1fr);
      align-items: start;
      gap: 4rem;
    }

    /* The stack's own spacing is for wider layouts; here it fills its column. The bottom margin makes room for
       the most-tilted card (10.8°), whose corner drops about 8.7% of its width below the box; a percentage
       margin is relative to the column, which is the card's width, so it scales with it. */
    .layout :global(.stack) {
      max-width: none;
      margin: 0 0 9%;
    }
  }
</style>
