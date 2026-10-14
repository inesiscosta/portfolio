<script lang="ts">
  import { untrack } from "svelte";
  import { inView } from "#lib/attachments/in-view.ts";
  import { TIMELINE } from "#lib/content/timeline.ts";
  import { timelineRequest } from "#lib/state/timeline.svelte.ts";

  const STEP_PX = 120;
  /** Half of .details (20rem): how far a description reaches either side of its event. */
  const DETAILS_HALF_PX = 160;
  const ADVANCE_MS = 2400;
  const RESUME_AFTER_MS = 10_000;

  const events = TIMELINE.toSorted((a, b) => a.date.localeCompare(b.date));
  const years = [...Map.groupBy(events, (event) => event.date.slice(0, 4))];

  let selected = $state(-1);
  let visible = $state(false);
  let paused = $state(false);
  let scroller = $state<HTMLElement>();

  // Selects the first event the first time the timeline scrolls into view.
  $effect(() => {
    if (visible && selected === -1) selected = 0;
  });

  // While visible and untouched, step through the events and keep the selected one in view.
  $effect(() => {
    if (!visible || paused || selected < 0 || selected >= events.length - 1) return;
    const timer = setTimeout(() => {
      selected += 1;
      scrollToSelected();
    }, ADVANCE_MS);
    return () => clearTimeout(timer);
  });

  // Hovering or focusing pauses the tour; it resumes after a while without interaction.
  $effect(() => {
    if (!paused) return;
    const timer = setTimeout(() => (paused = false), RESUME_AFTER_MS);
    return () => clearTimeout(timer);
  });

  // A photo in the About stack asked for its event: jump there, as if the visitor had picked it.
  $effect(() => {
    const { id, seq } = timelineRequest;
    if (id === null || seq === 0) return;
    const index = events.findIndex((event) => event.id === id);
    if (index === -1) return;
    untrack(() => {
      pick(index);
      scrollToSelected();
    });
  });

  function pick(index: number) {
    paused = true;
    selected = index;
  }

  /** Centres the selected event when its description (centred under it) would be cut off at either edge. */
  function scrollToSelected() {
    const event = scroller?.querySelectorAll<HTMLElement>(".event")[selected];
    if (!scroller || !event) return;
    const x = event.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    const margin = DETAILS_HALF_PX + 16;
    if (x - margin < scroller.scrollLeft || x + margin > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({ left: x - scroller.clientWidth / 2, behavior: "smooth" });
    }
  }
</script>

<section class="container timeline">
  <div class="scroller" bind:this={scroller} {@attach inView((isVisible) => (visible = isVisible))}>
    <!-- Ruler before the first event, so its description can sit centred under it without running off the start. -->
    <span class="lead" aria-hidden="true"></span>
    {#each years as [year, yearEvents] (year)}
      <div class="year">
        <span class="year-label">{year}</span>
        <div class="events" style:grid-template-columns="repeat({yearEvents.length}, {STEP_PX}px)">
          {#each yearEvents as event (event.id)}
            {@const index = events.indexOf(event)}
            <section class="event" class:selected={selected === index}>
              <button type="button" aria-current={selected === index ? "true" : undefined} onfocus={() => pick(index)} onclick={() => pick(index)}>
                <span class="sr-only">{year} — {event.heading}</span>
                <span class="stem" aria-hidden="true"></span>
                <event.icon size={20} class="event-icon" aria-hidden="true" />
              </button>
              <span class="ticks" aria-hidden="true"></span>
              <div class="details">
                <h2>{event.heading}</h2>
                <p>{event.description}</p>
              </div>
            </section>
          {/each}
        </div>
      </div>
    {/each}
    <div class="year">
      <span class="year-label">Today</span>
      <div class="events">
        <span class="stem today" aria-hidden="true"></span>
      </div>
    </div>
    <!-- Room after Today for the last event's centred description to scroll fully into view. -->
    <span class="trail" aria-hidden="true"></span>
  </div>
  <!-- Phones: the selected event's text sits here, under the ruler, instead of hanging off its event. -->
  <div class="current-slot">
    {#if selected >= 0}
      {#key selected}
        <div class="current">
          <h2>{events[selected]?.heading}</h2>
          <p>{events[selected]?.description}</p>
        </div>
      {/key}
    {/if}
  </div>
</section>

<style>
  .scroller {
    display: flex;
    /* Tall enough for the longest description (three lines), plus a strip at the bottom for the scrollbar, which
       macOS draws over the content's edge. */
    height: 15.5rem;
    margin-inline: calc(-1 * var(--gutter));
    padding: 1rem 1.5rem;
    overflow-x: auto;
  }

  @media (min-width: 1280px) {
    .scroller {
      margin-inline: 0;
    }
  }

  .year {
    position: relative;
  }

  /* 150px of ruler (plus the scroller's padding) clears the first description's 160px overhang. */
  .lead {
    flex: none;
    width: 150px;
    height: 0.625rem;
    margin-top: 1.5rem;
    background: linear-gradient(90deg, transparent 9px, var(--gray-500) 9px) 0 0 / 10px 10px;
  }

  .trail {
    flex: none;
    width: 60px;
  }

  .year-label {
    position: absolute;
    left: 0;
    color: var(--text-subtle);
    font-size: 0.75rem;
    font-weight: 600;
    transform: translateX(-50%);
    user-select: none;
  }

  .events {
    display: grid;
    margin-top: 1.5rem;
  }

  .event {
    position: relative;
  }

  button {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-inline: 0.75rem;
    transform: translateX(-50%);
  }

  .stem {
    display: block;
    width: 2px;
    height: 2rem;
    background: var(--gray-500);
    transition: all 0.2s var(--ease);
  }

  .selected .stem {
    height: 4rem;
    background: var(--accent);
  }

  button :global(.event-icon) {
    margin-top: 0.5rem;
    color: var(--text-muted);
    transition: color 0.2s;
  }

  .selected button :global(.event-icon) {
    color: var(--text-strong);
  }

  /* Ruler ticks every 10px along the top of the year. */
  .ticks {
    position: absolute;
    top: 0;
    left: 1px;
    width: 119px;
    height: 0.625rem;
    background: linear-gradient(90deg, transparent 9px, var(--gray-500) 9px) 0 0 / 10px 10px;
  }

  .details {
    position: relative;
    width: 20rem;
    margin-top: 6rem;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    transform: translateX(-50%);
    transition: opacity 0.2s;
  }

  .selected .details {
    opacity: 1;
    pointer-events: auto;
  }

  h2 {
    color: var(--text-strong);
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  p {
    color: var(--text-muted);
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.6;
    letter-spacing: -0.01em;
  }

  .current-slot {
    display: none;
  }

  /* Phones: a 20rem description centred under its event would run off the screen, so it moves out of the strip
     into one block under it, and the strip shrinks to the ruler. The ruler starts level with the page text and
     fades out at the right edge, so it reads as scrollable. */
  @media (max-width: 767px) {
    .scroller {
      height: auto;
      padding: 1rem 1.5rem 0.5rem calc(var(--gutter) + 1rem);
      -webkit-mask-image: linear-gradient(to right, #000 80%, transparent);
      mask-image: linear-gradient(to right, #000 80%, transparent);
    }

    .events {
      min-height: 6rem;
    }

    /* No descriptions in the strip here, so no room needed for them: the ruler starts level with the page text. */
    .details,
    .lead,
    .trail {
      display: none;
    }

    .current-slot {
      display: block;
      min-height: 6.5rem;
      margin-top: 0.75rem;
    }

    .current {
      animation: fade-in 0.3s var(--ease);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(0.25rem);
    }
  }
</style>
