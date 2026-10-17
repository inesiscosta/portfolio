<script lang="ts">
  import BentoGrid from "#lib/components/BentoGrid.svelte";
  import FilterChips from "#lib/components/FilterChips.svelte";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import { PROJECT_TAGS, PROJECTS, PROJECTS_PAGE } from "#lib/content/projects.ts";
  import { withViewTransition } from "#lib/view-transition.ts";

  const ALL = "All projects";
  // Only tags some project actually has, so no filter comes up empty.
  const FILTERS = [ALL, ...PROJECT_TAGS.filter((tag) => PROJECTS.some((project) => project.tags.includes(tag)))];

  let filter = $state(ALL);
  const shown = $derived(filter === ALL ? PROJECTS : PROJECTS.filter((project) => project.tags.some((tag) => tag === filter)));
</script>

<Seo title="Projects" description={PROJECTS_PAGE.intro} image="/og/projects.png" />

<section class="container projects" data-pagefind-body data-pagefind-meta="title:Projects">
  <PageHeader eyebrow={PROJECTS_PAGE.eyebrow} title={PROJECTS_PAGE.heading} intro={PROJECTS_PAGE.intro} />

  <div class="toolbar" data-pagefind-ignore>
    <FilterChips options={FILTERS} selected={[filter]} label="Filter projects" onselect={(tag) => withViewTransition(() => (filter = tag))} />
    <p class="count" aria-live="polite">{shown.length} {shown.length === 1 ? "project" : "projects"}</p>
  </div>

  <BentoGrid projects={shown} headingLevel={2} />
</section>

<style>
  .projects {
    padding-bottom: var(--page-bottom);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .count {
    color: var(--text-muted);
    font-size: 0.875rem;
  }
</style>
