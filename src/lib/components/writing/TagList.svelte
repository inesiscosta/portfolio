<script lang="ts">
  let { tags, label = "Tags" }: { tags: string[]; label?: string } = $props();
</script>

{#if tags.length > 0}
  <ul class="tags" aria-label={label}>
    {#each tags as tag (tag)}
      <!-- data-pagefind-filter lets search results be narrowed by tag later. -->
      <li class="tag" data-pagefind-filter="tag">{tag}</li>
    {/each}
  </ul>
{/if}

<style>
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag {
    padding: 0.1875rem 0.625rem;
    border-radius: var(--radius-full);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
  }
</style>
