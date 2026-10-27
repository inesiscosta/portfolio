<!-- A post's own component: anything Svelte can do, a post can embed. This one lives next to the post that uses it. -->
<script lang="ts">
  let count = $state(0);
</script>

<button type="button" onclick={() => (count += 1)}>Clicked {count} {count === 1 ? "time" : "times"}</button>

<style>
  button {
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--text-strong);
    font: inherit;
    cursor: pointer;
  }
</style>
