<script lang="ts">
  import MapPin from "@lucide/svelte/icons/map-pin";
  import { SITE } from "#lib/content/site.ts";
</script>

<!-- Styled like the hero's location line (LocationTime): accent pin, muted semibold text. -->
<p class="location">
  <MapPin size={16} aria-hidden="true" />
  <span>{SITE.location}</span>
</p>

<style>
  .location {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .location :global(svg) {
    flex-shrink: 0;
    color: var(--accent);
  }
</style>
