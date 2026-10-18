<script lang="ts">
  import Seo from "#lib/components/Seo.svelte";
  import AboutSummary from "#lib/components/sections/AboutSummary.svelte";
  import Contact from "#lib/components/sections/Contact.svelte";
  import Hero from "#lib/components/sections/Hero.svelte";
  import Projects from "#lib/components/sections/Projects.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo />
<Hero />
<AboutSummary about={data.about} />
<Projects />
<Contact />
