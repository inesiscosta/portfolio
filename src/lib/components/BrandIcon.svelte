<script lang="ts">
  import type { BrandIconData } from "#lib/content/brand-icons.ts";

  let { icon, size = 20, class: className = "" }: { icon: BrandIconData; size?: number; class?: string } = $props();
</script>

<svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d={icon.path} />
</svg>
