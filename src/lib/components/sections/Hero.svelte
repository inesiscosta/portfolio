<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import FileText from "@lucide/svelte/icons/file-text";
  import LocationTime from "#lib/components/LocationTime.svelte";
  import Footer from "#lib/components/layout/Footer.svelte";
  import OneTerminal from "#lib/components/OneTerminal.svelte";
  import ScrollCue from "#lib/components/ScrollCue.svelte";
  import TechCycle from "#lib/components/sections/TechCycle.svelte";
  import { HERO } from "#lib/content/hero.ts";
  import { HOME_FOOTER } from "#lib/content/site.ts";
</script>

<section class="hero">
  <div class="container grid">
    <div class="intro">
      <header>
        <p class="eyebrow">{HERO.pre}</p>
        <h1 class="display">I'm <strong>{HERO.name}</strong>, {HERO.role}</h1>
        <TechCycle icons={HERO.tech} />
      </header>
      {#each HERO.body as paragraph, index (index)}
        <p class="body">{paragraph}</p>
      {/each}
      <footer class="ctas">
        <a class="button primary" href={HERO.cta.primary.href}>
          {HERO.cta.primary.label}<ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <a class="button secondary" href={HERO.cta.secondary.href}>
          <FileText size={16} aria-hidden="true" />{HERO.cta.secondary.label}
        </a>
      </footer>
      <LocationTime class="hero-location" />
    </div>

    <div class="showcase">
      <div class="showcase-inner">
        <div class="editor-wrap">
          <OneTerminal />
        </div>
      </div>
    </div>

    <div class="glow" aria-hidden="true"></div>
  </div>

  <!-- The bottom of the first screen: the scroll cue and (see HOME_FOOTER) a copy of the footer. -->
  <div class="hero-bottom">
    <ScrollCue href="#about" label="Scroll to About" />
    {#if HOME_FOOTER.inHero}
      <!-- A visual copy of the page footer; the real one (keyboard, screen readers) is at the end of the page. -->
      <div class="footer-copy" inert aria-hidden="true">
        <Footer />
      </div>
    {/if}
  </div>
</section>

<style>
  /* The first screen is the hero alone: it fills the window below the header, the intro and terminal centred in
     it, and the scroll cue and footer along the bottom. */
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: calc(100svh - var(--header-height));
    overflow: hidden;
  }

  /* The leftover height is shared 3 : 2 between the space above the intro and the space below it (which the
     bottom bar takes up and pins to its end), so the intro sits a little low and the empty band left once the
     bar fades stays short. */
  .hero::before {
    content: "";
    flex: 3 1 0;
  }

  .hero-bottom {
    position: relative;
    display: flex;
    flex: 2 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  /* Fades out over the first third of a screen of scrolling, so it never shares the view with the footer at the
     end, and stops taking clicks or focus once gone. Browsers without scroll-driven animations just keep it. */
  @supports (animation-timeline: scroll()) {
    .hero-bottom {
      animation: fade-away linear both;
      animation-timeline: scroll(root);
      animation-range: 0 35vh;
    }
  }

  @keyframes fade-away {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }

  .footer-copy {
    align-self: stretch;
  }

  /* On phones the hero is taller than the screen, so a bar that fades out within the first screen of scrolling would
     only ever be seen as an empty band. */
  @media (max-width: 767px) {
    .hero-bottom {
      display: none;
    }
  }

  /* The footer's own padding is for the end of a page; here it sits closer to the cue. */
  .hero-bottom :global(.footer .inner) {
    padding-block: 0.5rem 1.25rem;
  }

  .grid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4rem 2rem;
    padding-block: 4rem;
  }

  .body {
    max-width: 65ch;
    margin-bottom: 0.75rem;
    color: var(--text-muted);
  }

  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .intro :global(.hero-location) {
    margin-top: 1.5rem;
  }

  .button {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.6875rem 2.25rem;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    transition:
      color 0.15s,
      background-color 0.15s,
      border-color 0.15s;
  }

  .button :global(svg) {
    transition: translate 0.15s var(--ease);
  }

  .primary {
    background: var(--button-primary);
    color: var(--button-primary-text);
  }

  .primary:hover,
  .primary:focus-visible {
    background: var(--button-primary-hover);
  }

  .primary:hover :global(svg) {
    translate: 2px -2px;
  }

  .secondary {
    border-color: var(--border-strong);
    background: var(--card);
    color: var(--text-strong);
  }

  .secondary:hover,
  .secondary:focus-visible {
    border-color: var(--text-strong);
  }

  .showcase {
    position: relative;
  }

  .showcase-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    min-width: min(460px, 100%);
  }

  .editor-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 16rem;
  }

  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -3;
    width: 50%;
    height: 66%;
    border-radius: var(--radius-full);
    background: radial-gradient(color-mix(in srgb, var(--accent) 28%, transparent), transparent 70%);
    filter: blur(40px);
    transform: translateY(-30%);
    pointer-events: none;
  }

  @media (min-width: 768px) {
    .grid {
      padding-block: 3rem;
    }

    .body {
      font-size: 1.0625rem;
      letter-spacing: -0.01em;
    }

    .editor-wrap {
      height: 20rem;
    }
  }

  @media (min-width: 1024px) {
    /* Wider than the site container, so the intro starts further left and the terminal gets more room. */
    .grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      max-width: var(--container-wide);
    }

    .showcase-inner {
      position: absolute;
      top: 4rem;
      left: 2rem;
      width: calc(100% - 2rem);
    }

    .editor-wrap {
      height: 20rem;
    }
  }
</style>
