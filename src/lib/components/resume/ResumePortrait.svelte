<script lang="ts">
  let { src, alt }: { src: string; alt: string } = $props();
</script>

<!-- A photo in a white frame, tilted one way, over a soft blue card tilted the other. -->
<figure class="portrait">
  <span class="backing" aria-hidden="true"></span>
  <span class="frame">
    <img {src} {alt} width="160" height="213" fetchpriority="high" />
  </span>
</figure>

<style>
  .portrait {
    position: relative;
    z-index: 1;
    display: grid;
    flex-shrink: 0;
    width: 8.75rem;
    height: 11rem;
  }

  .backing,
  .frame {
    grid-area: 1 / 1;
    border-radius: var(--radius-lg);
  }

  .backing {
    background: color-mix(in srgb, var(--accent) 22%, var(--bg));
    transform: rotate(-7deg) translate(-0.375rem, 0.25rem);
  }

  .frame {
    padding: 0.375rem;
    background: var(--card);
    box-shadow: var(--shadow-xl);
    transform: rotate(4deg);
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: calc(var(--radius-lg) - 0.25rem);
    object-fit: cover;
  }

  @media print {
    .backing {
      display: none;
    }

    .frame {
      box-shadow: none;
    }
  }
</style>
