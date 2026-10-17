<!--
  "Selected Projects" on the home page: the highlights, or one of a few tags, as a BentoGrid, with a
  "View all projects" link to /projects beside the filters.
-->
<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import BentoGrid from "#lib/components/BentoGrid.svelte";
  import FilterChips from "#lib/components/FilterChips.svelte";
  import { HOME_FILTER_TAGS, PROJECTS } from "#lib/content/projects.ts";
  import { withViewTransition } from "#lib/view-transition.ts";

  const HIGHLIGHTS = "Highlights";
  // The full list and every tag live on /projects ("View all projects"); here it's the highlights or one of a few
  // tags, skipping any no project has so no filter comes up empty.
  const FILTERS = [HIGHLIGHTS, ...HOME_FILTER_TAGS.filter((tag) => PROJECTS.some((project) => project.tags.includes(tag)))];

  let filter = $state(HIGHLIGHTS);

  const shown = $derived(
    PROJECTS.filter((project) => (filter === HIGHLIGHTS ? project.highlight === true : project.tags.some((tag) => tag === filter))),
  );
</script>

<section id="projects" class="projects" data-pagefind-body data-pagefind-meta="title:Projects">
  <div class="container inner">
    <header class="header">
      <div>
        <p class="eyebrow-mono">Projects</p>
        <h2 class="heading-2xl">Selected Projects.</h2>
      </div>
      <div class="controls" data-pagefind-ignore>
        <FilterChips options={FILTERS} selected={[filter]} label="Filter projects" onselect={(tag) => withViewTransition(() => (filter = tag))} />
        <a class="all-link" href="/projects">View all projects <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </header>

    <BentoGrid projects={shown} />
  </div>
</section>

<style>
  .projects {
    padding-top: var(--section-space);
    scroll-margin-top: var(--header-height);
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem 2rem;
    margin-bottom: 2rem;
  }

  .header .eyebrow-mono {
    margin-bottom: 0.5rem;
  }

  .header .heading-2xl {
    margin-bottom: 0;
  }

  /* The filter chips, then the link to /projects set off by a thin rule. */
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
  }

  .all-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-ink);
    font-size: 0.9375rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .all-link :global(svg) {
    transition: translate 0.15s var(--ease);
  }

  .all-link:hover :global(svg),
  .all-link:focus-visible :global(svg) {
    translate: 3px 0;
  }

  @media (min-width: 640px) {
    .all-link {
      padding-left: 1.25rem;
      border-left: 1px solid var(--border);
    }
  }

  @media (min-width: 1024px) {
    .inner {
      max-width: var(--container-wide);
    }
  }

</style>
