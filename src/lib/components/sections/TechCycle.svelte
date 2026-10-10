<script lang="ts">
  import { untrack } from "svelte";
  import BrandIcon from "#lib/components/BrandIcon.svelte";
  import type { BrandIconData } from "#lib/content/brand-icons.ts";

  let { icons }: { icons: readonly BrandIconData[] } = $props();

  const VISIBLE = 4;
  const SWAP_EVERY_MS = 4000;
  const GLITCH_MS = 400;

  let slots = $state(untrack(() => icons.slice(0, VISIBLE)));
  let glitching = $state(false);

  $effect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const waiting = icons.slice(VISIBLE);
    let swap: ReturnType<typeof setTimeout> | undefined;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      glitching = true;
      swap = setTimeout(() => {
        const incoming = waiting.splice(0, VISIBLE);
        waiting.push(...slots);
        slots = incoming;
      }, GLITCH_MS / 2);
      settle = setTimeout(() => (glitching = false), GLITCH_MS);
    }, SWAP_EVERY_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(swap);
      clearTimeout(settle);
    };
  });
</script>

<p class="sr-only">Technologies I work with: {icons.map(({ title }) => title).join(", ")}.</p>
<ul class="tech scrollbar-none" aria-hidden="true">
  {#each slots as icon, index (index)}
    <li class:glitch={glitching} style:--glitch-ms="{GLITCH_MS}ms">
      <BrandIcon {icon} size={28} />
      {icon.title}
    </li>
  {/each}
</ul>

<style>
  .tech {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin: 0 calc(-1 * var(--gutter)) 0.5rem;
    padding: 0 var(--gutter) 0.5rem;
    overflow-x: auto;
    color: var(--text-muted);
    font-size: 0.9375rem;
    font-weight: 500;
  }

  li {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  li :global(svg) {
    color: var(--text-subtle);
  }

  .glitch {
    animation: glitch var(--glitch-ms) steps(1, end);
  }

  @keyframes glitch {
    0% {
      clip-path: inset(0);
      transform: none;
      filter: none;
    }
    12% {
      clip-path: inset(15% 0 50% 0);
      transform: translateX(-3px);
      filter: drop-shadow(2px 0 var(--text-subtle)) drop-shadow(-2px 0 var(--accent));
    }
    25% {
      clip-path: inset(55% 0 10% 0);
      transform: translateX(3px);
      filter: drop-shadow(-2px 0 var(--text-subtle)) drop-shadow(2px 0 var(--accent));
    }
    37% {
      clip-path: inset(0 0 70% 0);
      transform: translateX(-2px);
      opacity: 0.6;
    }
    50% {
      clip-path: inset(35% 0 35% 0);
      transform: translateX(2px);
      opacity: 0.3;
    }
    62% {
      clip-path: inset(70% 0 0 0);
      transform: translateX(-3px);
      filter: drop-shadow(2px 0 var(--text-subtle)) drop-shadow(-2px 0 var(--accent));
      opacity: 0.8;
    }
    75% {
      clip-path: inset(10% 0 60% 0);
      transform: translateX(2px);
      filter: drop-shadow(-2px 0 var(--text-subtle)) drop-shadow(2px 0 var(--accent));
    }
    87% {
      clip-path: inset(0);
      transform: translateX(-1px);
      filter: none;
      opacity: 1;
    }
    100% {
      clip-path: inset(0);
      transform: none;
      filter: none;
    }
  }
</style>
