<!--
  A round button in the bottom-right corner that scrolls a post back to the top. It appears once the reader is
  a screen's height down the page, and scrolls smoothly unless they prefer reduced motion.
-->
<script lang="ts">
  import ChevronsUp from "@lucide/svelte/icons/chevrons-up";

  let scrollY = $state(0);
  let innerHeight = $state(0);

  const shown = $derived(innerHeight > 0 && scrollY > innerHeight);

  function toTop() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
</script>

<svelte:window bind:scrollY bind:innerHeight />

<button type="button" class="to-top" class:shown onclick={toTop} aria-label="Back to top" tabindex={shown ? 0 : -1} aria-hidden={!shown}>
  <ChevronsUp size={18} aria-hidden="true" />
</button>

<style>
  .to-top {
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    z-index: 20;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    background: var(--surface);
    color: var(--text-muted);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    transform: translateY(0.5rem);
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .to-top.shown {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .to-top:hover {
    border-color: var(--border-strong);
    color: var(--accent);
  }

  .to-top:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .to-top {
      transition: none;
    }
  }

  @media print {
    .to-top {
      display: none;
    }
  }
</style>
