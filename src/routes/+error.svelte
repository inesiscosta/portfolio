<script lang="ts">
  import Seo from "#lib/components/Seo.svelte";
  import { page } from "$app/state";

  const message = $derived(page.status === 404 ? "This page could not be found." : (page.error?.message ?? "Something went wrong."));
</script>

<Seo title={page.status === 404 ? "Page not found" : "Error"} />

<section class="error">
  <h1>{page.status}</h1>
  <p>{message}</p>
</section>

<style>
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding-inline: var(--gutter);
    text-align: center;
  }

  h1 {
    margin-right: 1.25rem;
    padding-right: 1.4375rem;
    border-right: 1px solid var(--border-strong);
    color: var(--text-strong);
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 3.0625rem;
  }

  p {
    color: var(--text);
    font-size: 0.875rem;
    line-height: 3.0625rem;
  }
</style>
