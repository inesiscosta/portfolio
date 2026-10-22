<script lang="ts">
  import type { Component } from "svelte";
  import { setPostRender } from "#lib/writing/context.ts";

  let { content: Content, feed = false }: { content: Component; feed?: boolean } = $props();

  // svelte-ignore state_referenced_locally -- a post body is rendered once per post (the page keys it by slug).
  setPostRender({ figures: 0, feed });
</script>

<Content />
