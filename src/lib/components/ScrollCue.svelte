<!-- A mouse-shaped pill with a dot that glides down and fades, on a loop: "there's more below". Links to `href`. -->
<script lang="ts">
  let { href, label }: { href: string; label: string } = $props();
</script>

<a class="cue" {href}>
  <span class="sr-only">{label}</span>
  <span class="pill" aria-hidden="true"><span class="dot"></span></span>
</a>

<style>
  .cue {
    display: grid;
    place-items: center;
    padding: 0.5rem;
    color: var(--text-subtle);
    transition: color 0.15s;
  }

  .cue:hover,
  .cue:focus-visible {
    color: var(--accent);
  }

  .pill {
    display: flex;
    justify-content: center;
    width: 1.375rem;
    height: 2.125rem;
    padding-top: 0.4375rem;
    border: 2px solid currentColor;
    border-radius: var(--radius-full);
  }

  .dot {
    width: 0.25rem;
    height: 0.4375rem;
    border-radius: var(--radius-full);
    background: currentColor;
    animation: glide 1.8s var(--ease) infinite;
  }

  @keyframes glide {
    0% {
      opacity: 0;
      transform: translateY(-2px);
    }

    25% {
      opacity: 1;
    }

    70% {
      opacity: 1;
      transform: translateY(0.625rem);
    }

    100% {
      opacity: 0;
      transform: translateY(0.75rem);
    }
  }

  /* No loop for reduced motion: the dot just rests at the top of the pill. */
  @media (prefers-reduced-motion: reduce) {
    .dot {
      animation: none;
    }
  }
</style>
