<script lang="ts">
  import type { Heading } from "#lib/writing/post.ts";

  let { headings, active }: { headings: Heading[]; active?: string } = $props();

  // h3s nest under the h2 before them; an h3 before any h2 stays top-level.
  const groups = $derived.by(() => {
    const result: { heading: Heading; children: Heading[] }[] = [];
    for (const heading of headings) {
      const parent = result.at(-1);
      if (heading.depth === 3 && parent) parent.children.push(heading);
      else result.push({ heading, children: [] });
    }
    return result;
  });
</script>

{#snippet item(heading: Heading)}
  <a href="#{heading.id}" class:active={heading.id === active} aria-current={heading.id === active ? "location" : undefined}>
    {heading.text}
  </a>
{/snippet}

<ol class="toc">
  {#each groups as group (group.heading.id)}
    <li>
      {@render item(group.heading)}
      {#if group.children.length > 0}
        <ol class="sub">
          {#each group.children as child (child.id)}
            <li>{@render item(child)}</li>
          {/each}
        </ol>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .toc {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .sub {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    margin: 0.125rem 0 0.375rem 1rem;
    padding-left: 0.25rem;
    border-left: 1px solid var(--line);
  }

  a {
    position: relative;
    display: block;
    padding: 0.25rem 0 0.25rem 1rem;
    color: var(--text-muted);
    transition: color 0.15s;
  }

  .sub a {
    padding-left: 0.75rem;
    font-size: 0.8125rem;
  }

  a:hover {
    color: var(--text-strong);
  }

  a.active {
    color: var(--accent-ink);
    font-weight: 500;
  }

  a.active::before {
    content: "";
    position: absolute;
    inset: 0.25rem auto 0.25rem 0;
    width: 3px;
    border-radius: var(--radius-full);
    background: var(--accent);
  }

  .sub a.active::before {
    left: -0.3125rem;
  }
</style>
