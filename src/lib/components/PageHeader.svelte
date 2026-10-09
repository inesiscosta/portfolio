<!--
  The heading block every top-level page starts with (About, Projects, Writing, Resume), so they all begin at the
  same height with the same label, title size and spacing. `actions` (buttons) sit on the right on wide screens;
  set --page-header-actions on a parent to fix that column's width (the resume matches its sidebar).
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  let { eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: Snippet } = $props();
</script>

<header class="page-header" class:with-actions={actions}>
  <div class="text">
    <p class="eyebrow-mono">{eyebrow}</p>
    <h1>{title}</h1>
    {#if intro}
      <p class="intro">{intro}</p>
    {/if}
  </div>
  {#if actions}
    <div class="actions">{@render actions()}</div>
  {/if}
</header>

<style>
  .page-header {
    display: grid;
    gap: 1.25rem 3rem;
    padding-top: var(--page-top);
    margin-bottom: 2rem;
  }

  .eyebrow-mono {
    margin-bottom: 0.75rem;
  }

  h1 {
    color: var(--text-strong);
    font-size: clamp(2.25rem, 1.6rem + 2vw, 3.25rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.035em;
  }

  .intro {
    max-width: 40rem;
    margin-top: 0.875rem;
    color: var(--text-muted);
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Titles stay on one line once there's room for them. */
  @media (min-width: 768px) {
    h1 {
      white-space: nowrap;
    }
  }

  @media (min-width: 1024px) {
    .with-actions {
      grid-template-columns: minmax(0, 1fr) var(--page-header-actions, auto);
      align-items: end;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
