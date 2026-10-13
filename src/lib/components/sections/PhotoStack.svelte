<script lang="ts">
  import { type AboutImage, isVideo } from "#lib/content/about.ts";
  import { showTimelineEvent } from "#lib/state/timeline.svelte.ts";

  let { images: initial }: { images: AboutImage[] } = $props();

  // A deck of tilted photos: clicking flicks the top one away; after the last, the deck reshuffles.
  let shuffled = $state<AboutImage[]>();
  const images = $derived(shuffled ?? initial);
  let focus = $state(0);
  // Keyed by src so it survives a reshuffle.
  let loaded = $state<Record<string, boolean>>({});

  // A video plays only while it's the top card; re-runs whenever `focus` changes.
  const playWhenOnTop = (index: number) => (video: HTMLVideoElement) => {
    if (focus === index) video.play().catch(() => {});
    else video.pause();
  };

  // Every photo sits in the viewport at once, so `loading="lazy"` can't defer them: only fetch the
  // top few, plus anything already fetched, and the rest load as the deck is flicked through.
  const AHEAD = 2;
  const shouldLoad = (index: number, src: string) => index <= focus + AHEAD || loaded[src] === true;

  const tilt = (index: number) => (index % 4) * (index % 2 === 0 ? 0.5 : -1.2) * 3;

  // A photo tagged with a timeline event moves the timeline there when it comes to the top.
  function showEvent() {
    const event = images[focus]?.event;
    if (event) showTimelineEvent(event);
  }

  // Touch screens have no hover, so the caption shows for a moment after each tap.
  let revealed = $state(false);
  let revealTimer: ReturnType<typeof setTimeout> | undefined;
  function reveal() {
    clearTimeout(revealTimer);
    revealed = true;
    revealTimer = setTimeout(() => (revealed = false), 1800);
  }

  function next() {
    reveal();
    if (focus < images.length - 1) {
      focus += 1;
      showEvent();
      return;
    }
    focus += 1;
    setTimeout(() => {
      shuffled = images.toSorted(() => 0.5 - Math.random());
      focus = 0;
      showEvent();
    }, 350);
  }
</script>

<!-- The button's name is fixed and only the top card is exposed, otherwise screen readers would read every alt as its name. -->
<button type="button" class="stack" class:revealed aria-label="Show the next photo" onclick={next}>
  {#each images as image, index (image.src)}
    <!-- A span, not a figure: a button only takes phrasing content. -->
    <span
      class="item"
      class:loaded={loaded[image.src]}
      class:top={focus === index}
      aria-hidden={focus !== index}
      style:z-index={-index}
      style:filter={focus === index ? "" : "grayscale(0.8)"}
      style:opacity={focus > index ? 0 : 1}
      style:transform={focus > index
        ? `translate(-700px, -${(index % 4) * 60 + 25}px) rotate(${tilt(index)}deg)`
        : `rotate(${tilt(index)}deg)`}
    >
      {#if isVideo(image.src)}
        <video
          src={shouldLoad(index, image.src) ? image.src : undefined}
          aria-label={image.alt}
          muted
          loop
          playsinline
          preload="auto"
          onloadeddata={() => (loaded[image.src] = true)}
          {@attach playWhenOnTop(index)}
        ></video>
      {:else}
        <img
          src={shouldLoad(index, image.src) ? image.src : undefined}
          srcset={shouldLoad(index, image.src) ? image.srcset : undefined}
          sizes="(max-width: 600px) 100vw, 540px"
          alt={image.alt}
          width="2000"
          height="1500"
          decoding="async"
          onload={() => (loaded[image.src] = true)}
        />
      {/if}
      <span class="caption" aria-hidden="true">{image.alt}</span>
    </span>
  {/each}
  <span class="backing" aria-hidden="true"></span>
</button>

<style>
  .stack {
    position: relative;
    width: 100%;
    max-width: 540px;
    max-height: 405px;
    aspect-ratio: 3 / 2;
    margin: 0 auto 3rem;
  }

  .item {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border: 2px solid var(--card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    transition: all 0.3s var(--ease);
  }

  .item img,
  .item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* A subtitle-style box floating above the bottom edge, sized to its text. Only the top card's shows: on hover, keyboard
     focus, or for a moment after a tap. */
  .caption {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    width: max-content;
    max-width: calc(100% - 2rem);
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-sm);
    background: rgb(0 0 0 / 0.7);
    color: #fff;
    font-size: 0.875rem;
    line-height: 1.4;
    text-align: center;
    text-wrap: balance;
    opacity: 0;
    transform: translateX(-50%);
    transition: opacity 0.2s var(--ease);
  }

  .stack:hover .top .caption,
  .stack:focus-visible .top .caption,
  .stack.revealed .top .caption {
    opacity: 1;
  }

  /* Hidden until decoded, so a half-loaded photo never flashes in. */
  .item:not(.loaded) {
    opacity: 0 !important;
  }

  :global(.dark) .item {
    border-color: var(--gray-600);
  }

  .stack:focus-visible .item {
    border-color: var(--accent);
  }

  .backing {
    position: absolute;
    inset: 0;
    z-index: -50;
    border-radius: var(--radius-lg);
    background: var(--surface);
    transform: rotate(-6deg);
  }

  @media (min-width: 1024px) {
    .stack {
      aspect-ratio: 4 / 3;
      margin: 0 0 auto auto;
    }
  }
</style>
