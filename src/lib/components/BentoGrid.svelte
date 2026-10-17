<!--
  Projects as a bento grid (layout rules in #lib/bento.ts): one column on phones, two on tablets (half-row
  tiles span both), twelve on desktop. Each tile has its own view-transition-name, so when a filter changes the
  list through withViewTransition (#lib/view-transition.ts), tiles glide and resize into their new places and
  the ones coming or going fade.
-->
<script lang="ts">
  import { bento } from "#lib/bento.ts";
  import ProjectTile from "#lib/components/ProjectTile.svelte";
  import type { Project } from "#lib/content/projects.ts";

  let { projects, headingLevel = 3 }: { projects: Project[]; headingLevel?: 2 | 3 } = $props();

  const cells = $derived(bento(projects));

  const transitionName = (name: string) => `project-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
</script>

<ul class="bento">
  {#each cells as cell (cell.project.name)}
    <li class={cell.variant} style:--span={cell.span} style:view-transition-name={transitionName(cell.project.name)}>
      <ProjectTile project={cell.project} variant={cell.variant} {headingLevel} />
    </li>
  {/each}
</ul>

<style>
  /* Tiles move a little slower than the default, and ease out. Scoped to the "project" view-transition class
     so the theme crossfade (app.css) keeps its own timing. */
  .bento > li {
    view-transition-class: project;
  }

  :global(::view-transition-group(*.project)) {
    animation-duration: 0.4s;
    animation-timing-function: var(--ease);
  }

  .bento {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .bento > li {
    display: flex;
  }

  @media (min-width: 768px) {
    .bento {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .row {
      grid-column: span 2;
    }
  }

  @media (min-width: 1024px) {
    .bento {
      grid-template-columns: repeat(12, minmax(0, 1fr));
    }

    .bento > li {
      grid-column: span var(--span);
    }
  }
</style>
