<script lang="ts">
  import BookOpen from "@lucide/svelte/icons/book-open";

  let { text }: { text: string } = $props();
</script>

<aside class="tldr" aria-label="TL;DR">
  <p class="label"><BookOpen size={16} aria-hidden="true" /> TL;DR</p>
  <p>{text}</p>
</aside>

<style>
  .tldr {
    padding: 1rem 1.125rem;
    border-radius: var(--radius-lg);
    background: var(--accent-soft);
    color: var(--text);
    font-size: 0.875rem;
    line-height: 1.55;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: var(--accent-ink);
    font-weight: 600;
  }
</style>
