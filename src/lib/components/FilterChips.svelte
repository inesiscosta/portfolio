<!-- A row of pill buttons: the project filters on the home page and /projects (one pressed at a time) and the resume's
     focus picker (any number). `onselect` gets the clicked option; the parent owns the state, so it decides whether
     that replaces or toggles, and can wrap the change in a view transition. -->
<script lang="ts" generics="T extends string">
  let {
    options,
    selected,
    label,
    size = "md",
    onselect,
  }: {
    options: readonly T[];
    selected: readonly T[];
    label: string;
    size?: "md" | "sm";
    onselect: (option: T) => void;
  } = $props();
</script>

<div class="chips {size}" role="group" aria-label={label}>
  {#each options as option (option)}
    <button type="button" aria-pressed={selected.includes(option)} onclick={() => onselect(option)}>{option}</button>
  {/each}
</div>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  button {
    padding: 0.4375rem 1.125rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 500;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .sm {
    gap: 0.375rem;
  }

  .sm button {
    padding: 0.1875rem 0.75rem;
    font-size: 0.75rem;
  }

  button:hover {
    border-color: var(--accent);
    color: var(--text-strong);
  }

  button[aria-pressed="true"] {
    border-color: color-mix(in srgb, var(--accent) 35%, transparent);
    background: var(--accent-soft);
    color: var(--accent-ink);
  }
</style>
