<script lang="ts">
  import PageHeader from "#lib/components/PageHeader.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import About from "#lib/components/sections/About.svelte";
  import Timeline from "#lib/components/sections/Timeline.svelte";
  import { ABOUT_LABELS } from "#lib/content/about.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo title="About" description={data.about.summary} image="/og/about.png" />

<About about={data.about}>
  {#snippet heading()}
    <PageHeader eyebrow={ABOUT_LABELS.eyebrow} title={data.about.heading} />
  {/snippet}
</About>
<!-- Photos tagged with an event move this timeline to it as they come to the top of the stack. -->
<Timeline />
