<script lang="ts">
  import MapPin from "@lucide/svelte/icons/map-pin";
  import { SITE } from "#lib/content/site.ts";
  import { localTime } from "#lib/local-time.ts";

  let { class: className = "" }: { class?: string } = $props();

  // The page is prerendered, so the time only appears once it's running in the browser.
  let now = $state<Date>();
  $effect(() => {
    now = new Date();
    const timer = setInterval(() => (now = new Date()), 10_000);
    return () => clearInterval(timer);
  });
</script>

<p class="location {className}">
  <MapPin size={16} aria-hidden="true" />
  <span>{SITE.location}</span>
  {#if now}
    <span class="time">
      · <time datetime={now.toISOString()}>{localTime(now)}</time> local time
    </span>
  {/if}
</p>

<style>
  .location {
    display: flex;
    flex-wrap: wrap;
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

  .time {
    color: var(--text-subtle);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    animation: fade-in 0.4s var(--ease);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
</style>
