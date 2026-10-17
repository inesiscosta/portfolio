<!--
  One project as a bordered tile, in one of three layouts (chosen by #lib/bento.ts):
    row      image beside the text (half-row tiles)
    stack    image on top, then the text (quarter-row tiles)
    compact  a small thumbnail beside the text (projects without a screenshot)
  Without a screenshot the image area shows an icon for the project's first tag. The whole tile links to the
  project's write-up, site or repository (projectHref) through the title's stretched link.
-->
<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Code from "@lucide/svelte/icons/code";
  import Cpu from "@lucide/svelte/icons/cpu";
  import FlaskConical from "@lucide/svelte/icons/flask-conical";
  import Gamepad2 from "@lucide/svelte/icons/gamepad-2";
  import GitBranch from "@lucide/svelte/icons/git-branch";
  import Globe from "@lucide/svelte/icons/globe";
  import Layers from "@lucide/svelte/icons/layers";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import Workflow from "@lucide/svelte/icons/workflow";
  import Wrench from "@lucide/svelte/icons/wrench";
  import type { Component } from "svelte";
  import type { BentoVariant } from "#lib/bento.ts";
  import { PROJECT_TAG_ICONS, type Project, projectHref } from "#lib/content/projects.ts";
  import type { ProjectIcon } from "#lib/content/shared.ts";

  let { project, variant = "row", headingLevel = 3 }: { project: Project; variant?: BentoVariant; headingLevel?: 2 | 3 } = $props();

  const ICONS: Record<ProjectIcon, Component> = {
    code: Code,
    cpu: Cpu,
    workflow: Workflow,
    "flask-conical": FlaskConical,
    "git-branch": GitBranch,
    "gamepad-2": Gamepad2,
    wrench: Wrench,
    layers: Layers,
    globe: Globe,
    smartphone: Smartphone,
  };

  const href = $derived(projectHref(project));
  const external = $derived(href !== undefined && /^https?:/.test(href));
  const pills = $derived([...project.tech.map((tech) => tech.title), ...(project.topics ?? [])].slice(0, 3));
  const Icon = $derived(ICONS[(project.tags[0] && PROJECT_TAG_ICONS[project.tags[0]]) || "layers"]);
</script>

<article class="tile {variant}">
  <div class="media">
    {#if project.image}
      <img src={project.image} alt="" width="2000" height="1500" loading="lazy" decoding="async" />
    {:else}
      <span class="placeholder" aria-hidden="true"><Icon strokeWidth={1.5} /></span>
    {/if}
  </div>
  <div class="body">
    <svelte:element this={`h${headingLevel}`} class="title">
      {#if href}
        <a {href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {project.name}{#if external}<span class="sr-only"> (opens in a new tab)</span>{/if}
        </a>
      {:else}
        {project.name}
      {/if}
    </svelte:element>
    <p class="description">{project.description}</p>
    {#if pills.length > 0}
      <ul class="pills" aria-label="Built with">
        {#each pills as pill (pill)}
          <li>{pill}</li>
        {/each}
      </ul>
    {/if}
  </div>
  {#if href}
    <span class="go" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={1.75} /></span>
  {/if}
</article>

<style>
  .tile {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    background: var(--card);
    transition:
      border-color 0.2s var(--ease),
      box-shadow 0.2s var(--ease),
      translate 0.2s var(--ease);
  }

  .tile:hover,
  .tile:has(a:focus-visible) {
    translate: 0 -2px;
    border-color: var(--accent);
    box-shadow: var(--shadow-lg);
  }

  .tile:has(a:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Row: image beside the text once there's room. */
  @media (min-width: 480px) {
    .row {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      align-content: stretch;
      align-items: stretch;
      gap: 1.25rem;
    }

    /* The image fills the card's height, so a row tile beside taller tiles has no empty band under it. */
    .row .media {
      aspect-ratio: auto;
      min-height: 10rem;
    }

    .row .body {
      justify-content: center;
    }

    .compact {
      grid-template-columns: 5rem minmax(0, 1fr);
      align-items: start;
      gap: 1rem;
    }
  }

  .media {
    overflow: hidden;
    aspect-ratio: 16 / 10;
    border: 1px solid var(--card-border);
    border-radius: var(--radius);
    background: var(--surface-soft);
  }

  .compact .media {
    aspect-ratio: 1;
  }

  .stack .media {
    aspect-ratio: 16 / 9;
  }

  .stack .description {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  /* On phones a compact tile is a plain text card: the thumbnail would only crowd it. */
  @media (max-width: 479.98px) {
    .compact .media {
      display: none;
    }
  }

  .media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    background: var(--accent-soft);
    color: var(--accent-ink);
  }

  .placeholder :global(svg) {
    width: 30%;
    max-width: 3rem;
    height: auto;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    padding-right: 1.5rem;
  }

  .stack .body {
    padding-right: 0;
  }

  .title {
    color: var(--text-strong);
    font-size: 1.1875rem;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .row .title {
    font-size: 1.375rem;
  }

  /* The whole card is the link, through the title's stretched ::after. */
  .title a::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .title a:focus-visible {
    outline: none;
  }

  .go {
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: var(--text-muted);
    transition:
      color 0.15s,
      translate 0.15s var(--ease);
  }

  /* On image-on-top tiles the arrow sits on the image, so give it a backing to stay readable. */
  .stack .go {
    top: 1.5rem;
    right: 1.5rem;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-full);
    background: var(--card);
  }

  .tile:hover .go {
    color: var(--accent-ink);
    translate: 2px -2px;
  }

  .description {
    display: -webkit-box;
    overflow: hidden;
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding-top: 0.25rem;
  }

  .pills li {
    padding: 0.125rem 0.625rem;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-full);
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (prefers-reduced-motion: reduce) {
    .tile:hover,
    .tile:has(a:focus-visible),
    .tile:hover .go {
      translate: none;
    }
  }
</style>
