<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import { inView } from "#lib/attachments/in-view.ts";

  let {
    id,
    title,
    open = $bindable(true),
    onvisible,
    children,
  }: {
    id: string;
    title: string;
    open?: boolean;
    /** Fires as the section enters or leaves the middle band of the viewport. */
    onvisible: (id: string, visible: boolean) => void;
    children: Snippet;
  } = $props();
</script>

<section {id} class="section" {@attach inView((visible) => onvisible(id, visible), { rootMargin: "-45% 0px -25% 0px" })}>
  <header>
    <h2>
      <button type="button" class="title" aria-expanded={open} aria-controls="{id}-content" onclick={() => (open = !open)}>
        <span>{title}</span>
        <hr class="rule" />
      </button>
      <!-- Same as clicking the title; kept out of the tab order so keyboard users meet one control. -->
      <button type="button" class="toggle" tabindex="-1" aria-hidden="true" onclick={() => (open = !open)}>
        <ChevronDown size={16} class={open ? "" : "flipped"} />
      </button>
    </h2>
  </header>
  {#if open}
    <div id="{id}-content" class="content" transition:slide={{ duration: 200 }}>
      {@render children()}
    </div>
  {/if}
</section>

<style>
  .section {
    /* How far the dashed rule stops short of the right edge: the chevron button (padding + 16px icon) and its
       margin. Entries line things up with the end of the rule through this (the grade pill). */
    --rule-end: calc(1.5rem + 16px);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    scroll-margin-top: calc(var(--header-height) + 2.5rem);
    break-inside: avoid;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h2 {
    display: flex;
    align-items: baseline;
  }

  /* Spans the whole row up to the chevron, so tapping anywhere on it opens or closes the section. */
  .title {
    flex: 1;
    display: flex;
    align-items: baseline;
    color: var(--text-strong);
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    text-align: left;
  }

  .toggle {
    margin: 0 0.5rem 0 auto;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    color: var(--text-subtle);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .toggle:hover,
  .toggle:focus-visible {
    background: var(--surface);
    color: var(--text-strong);
  }

  .toggle :global(svg) {
    transition: transform 0.2s var(--ease);
  }

  .toggle :global(.flipped) {
    transform: rotate(180deg);
  }

  /* Dashed rule running on from the end of the title, level with its middle. */
  .rule {
    flex: 1;
    align-self: center;
    height: 2px;
    margin-left: 1.25rem;
    border: none;
    background: linear-gradient(90deg, var(--line) 60%, transparent 0) 0 0 / 10px 2px;
  }

  @media print {
    .section {
      gap: 0.5rem;
    }

    .title {
      font-size: 1.25rem;
    }

    .section {
      --rule-end: 6rem;
    }

    .rule {
      height: 0;
      margin: 0 6rem 0 1.5rem;
      border-top: 1px dashed var(--gray-400);
      background: none;
    }

    .toggle {
      display: none;
    }
  }
</style>
