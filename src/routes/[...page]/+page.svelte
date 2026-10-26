<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<!-- A standalone page from the content repo's writing/pages; see +page.ts. -->
<data.component />
