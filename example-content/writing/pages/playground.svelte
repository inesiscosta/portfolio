<!--
  A standalone page: pages/<path>.svelte is served at /<path> (this one at /playground). For things a post links to
  that need a whole page: an app, a full-screen demo.
-->
<script lang="ts">
  import PageHeader from "#lib/components/PageHeader.svelte";
  import Seo from "#lib/components/Seo.svelte";
</script>

<Seo title="Playground" description="A standalone page from writing/pages." />

<div class="container">
  <PageHeader eyebrow="Playground" title="A page of its own." intro="Anything a post needs a whole page for goes in pages/." />
</div>
