<!--
  Unnumbered margin note with block content: Markdown, code blocks, lists, images. Put it on its own,
  with blank lines around it and inside it, just before the paragraph or block it sits beside:

    <MarginNote side="left">

    The same function, written with stack operations:

    ```rust
    …
    ```

    </MarginNote>

  On wide screens it moves into the left or right margin, top-aligned with what follows it; on narrow
  screens it stays in the text flow. Placement is shared with Sidenote and lives in Prose.svelte.
  Adapted from Egas Ribeiro's Hugo shortcode (https://riogu.github.io), used with his permission.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  let { side = "right", offset = "0px", children }: { side?: "left" | "right"; offset?: string; children: Snippet } = $props();
</script>

<aside class="margin-note margin-note-{side}" style:--side-offset={offset} aria-label="Margin note">
  {@render children()}
</aside>
