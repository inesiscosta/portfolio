<!-- The short About on the home page, after the hero: photos, a few lines, the stats, and a link to /about. -->
<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import PhotoStack from "#lib/components/sections/PhotoStack.svelte";
  import { ABOUT_LABELS, type About } from "#lib/content/about.ts";

  /** Loaded from R2 by about.server.ts. */
  let { about }: { about: About } = $props();
</script>

<section id="about" class="container summary" aria-labelledby="about-summary-heading">
  {#if about.images.length > 0}
    <div class="photos">
      <PhotoStack images={about.images} />
    </div>
  {/if}

  <div class="text">
    <p class="eyebrow-mono">{ABOUT_LABELS.eyebrow}</p>
    <h2 id="about-summary-heading">{about.heading}</h2>
    <p class="body">{about.summary}</p>
    <a class="more" href={ABOUT_LABELS.link.href}>{ABOUT_LABELS.link.label} <ArrowRight size={14} aria-hidden="true" /></a>
  </div>

  <dl class="stats">
    {#each about.stats as stat (stat.caption)}
      <div class="stat">
        <dt>{stat.caption}</dt>
        <dd>{stat.statistic}</dd>
      </div>
    {/each}
  </dl>
</section>

<style>
  .summary {
    display: grid;
    gap: 2.5rem;
    align-items: center;
    /* Right under the hero, which already ends in open space (where the scroll cue and its footer were). */
    padding-top: 2.5rem;
    scroll-margin-top: var(--header-height);
  }

  .photos {
    width: 100%;
    max-width: 22rem;
    margin-inline: auto;
  }

  /* The stack's own spacing is for the full About section; here it just fills its column. */
  .photos :global(.stack) {
    max-width: none;
    margin: 0;
    aspect-ratio: 3 / 2;
  }

  .text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  h2 {
    color: var(--text-strong);
    font-size: clamp(1.75rem, 1.4rem + 1vw, 2.25rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
  }

  .body {
    max-width: 34rem;
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
    text-align: justify;
    /* Evens out line lengths so justifying doesn't open wide gaps between words. */
    text-wrap: pretty;
  }

  .more {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.75rem;
    color: var(--accent-ink);
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .more :global(svg) {
    transition: translate 0.15s var(--ease);
  }

  .more:hover :global(svg) {
    translate: 3px 0;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 0.25rem;
    user-select: none;
  }

  dd {
    color: var(--accent-ink);
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  dt {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.3;
  }

  @media (min-width: 640px) {
    .stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    /* As wide as the hero and the projects, so the three line up. */
    .summary {
      grid-template-columns: 20rem minmax(0, 1fr) auto;
      gap: 3rem;
      max-width: var(--container-wide);
    }

    .photos {
      max-width: none;
    }

    .stats {
      grid-template-columns: repeat(2, 8.5rem);
      padding-left: 2.5rem;
      border-left: 1px solid var(--border);
    }
  }
</style>
