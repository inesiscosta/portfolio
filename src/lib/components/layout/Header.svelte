<script lang="ts">
  import Command from "@lucide/svelte/icons/command";
  import BrandIcon from "#lib/components/BrandIcon.svelte";
  import MobileNav from "#lib/components/layout/MobileNav.svelte";
  import ThemeIcon from "#lib/components/ThemeIcon.svelte";
  import { isCurrentNav, NAV, SITE, SOCIAL_LINKS } from "#lib/content/site.ts";
  import { openPalette } from "#lib/state/palette.svelte.ts";
  import { setTheme, theme } from "#lib/state/theme.svelte.ts";
  import { page } from "$app/state";

  let menuOpen = $state(false);
  // The rule under the header only shows once content scrolls beneath it.
  let scrollY = $state(0);

  // The highlight pill slides between desktop links on hover/focus instead of each link lighting up.
  let highlight = $state({ left: 0, top: 0, width: 0, height: 0, visible: false, animate: false });

  function moveHighlight(target: HTMLElement) {
    highlight = {
      left: target.offsetLeft,
      top: target.offsetTop,
      width: target.offsetWidth,
      height: target.offsetHeight,
      // Jump into place when appearing, glide when moving between links.
      animate: highlight.visible,
      visible: true,
    };
  }

  function hideHighlight() {
    highlight.visible = false;
  }
</script>

<svelte:window bind:scrollY />

<header class="header" class:scrolled={scrollY > 4}>
  <div class="container bar">
    <a href="/" class="wordmark" aria-label="{SITE.name}, home" onclick={() => (menuOpen = false)}>
      <span class="tilde" aria-hidden="true">~/</span><span aria-hidden="true">{SITE.handle}</span>
    </a>

    <nav class="desktop-nav" aria-label="Main" onmouseleave={hideHighlight}>
      <span
        class="highlight"
        class:visible={highlight.visible}
        class:animate={highlight.animate}
        style:left="{highlight.left}px"
        style:top="{highlight.top}px"
        style:width="{highlight.width}px"
        style:height="{highlight.height}px"
        aria-hidden="true"
      ></span>
      {#each NAV.filter(({ desktop }) => desktop) as link (link.href)}
        <a
          href={link.href}
          class="nav-link"
          class:active={isCurrentNav(link, page.url.pathname)}
          aria-current={page.url.pathname === link.href ? "page" : isCurrentNav(link, page.url.pathname) ? "true" : undefined}
          onmouseenter={(event) => moveHighlight(event.currentTarget)}
          onfocus={(event) => moveHighlight(event.currentTarget)}
          onblur={hideHighlight}
        >
          {link.title}
        </a>
      {/each}
    </nav>

    <div class="actions">
      <a href={SOCIAL_LINKS.github.href} class="icon-button" target="_blank" rel="noopener noreferrer">
        <span class="sr-only">GitHub</span>
        <BrandIcon icon={SOCIAL_LINKS.github.icon} />
      </a>
      <!-- Keyboard-first, so desktop only; phones get the theme toggle and the menu instead. -->
      <button type="button" class="icon-button palette-button" aria-haspopup="dialog" onclick={openPalette}>
        <span class="sr-only">Search and commands</span>
        <Command size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button type="button" class="icon-button theme-toggle" onclick={() => setTheme(!theme.dark)}>
        <span class="sr-only">Switch colour theme</span>
        <ThemeIcon />
      </button>
      <MobileNav bind:open={menuOpen} />
    </div>
  </div>
</header>
<div class="spacer" aria-hidden="true"></div>

<style>
  .header {
    --nav-text: var(--text-muted);
    position: fixed;
    inset: 0 0 auto;
    z-index: 50;
    height: var(--header-height);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s var(--ease);
  }

  :global(.dark) .header {
    --nav-text: var(--gray-200);
  }

  .header.scrolled {
    border-bottom-color: var(--border);
  }

  /* The blur sits on a pseudo-element: backdrop-filter on .header itself would make it the
     containing block for the fixed mobile menu, trapping the menu inside the 64px bar. */
  .header::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: color-mix(in srgb, var(--bg) 60%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .spacer {
    height: var(--header-height);
  }

  .bar {
    /* Full width, with the ends inset by a share of the window (see --edge-inset). */
    max-width: none;
    padding-inline: var(--edge-inset);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 100%;
  }

  /* A path-like handle in mono, like the terminal and the mono labels around the site. */
  .wordmark {
    position: relative;
    z-index: 51;
    color: var(--text-strong);
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .tilde {
    color: var(--accent-ink);
    transition: color 0.15s;
  }

  .wordmark:hover .tilde {
    color: var(--accent);
  }

  .desktop-nav {
    position: relative;
    isolation: isolate;
    display: none;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding-inline: 0.5rem;
  }

  .nav-link {
    position: relative;
    z-index: 1;
    padding: 0.375rem 0.75rem;
    border: 2px solid transparent;
    border-radius: var(--radius);
    color: var(--nav-text);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.15s;
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    color: var(--text-strong);
    outline: none;
  }

  .nav-link.active {
    color: var(--accent-ink);
  }

  .highlight {
    position: absolute;
    z-index: -1;
    border: 2px solid var(--border-strong);
    border-radius: var(--radius);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s;
  }

  .highlight.visible {
    opacity: 1;
  }

  .highlight.animate {
    transition:
      left 0.18s var(--ease),
      width 0.18s var(--ease),
      opacity 0.1s;
  }

  .actions {
    position: relative;
    z-index: 51;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: auto;
    padding-left: 1rem;
  }

  .icon-button {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-sm);
    color: var(--nav-text);
    transition: color 0.15s;
  }

  .icon-button:hover,
  :global(html[data-theme-switching]) .theme-toggle {
    color: var(--text-strong);
  }

  .palette-button {
    display: none;
  }

  @media (min-width: 768px) {
    /* Equal flexible sides keep the nav centred while letting the actions take the room they need. */
    .bar {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1rem;
    }

    .actions {
      justify-self: end;
    }

    .desktop-nav {
      display: flex;
    }

    .palette-button {
      display: grid;
    }

    .actions {
      padding-left: 0;
      /* The last button's padding would otherwise push the icon in from the container edge. */
      margin-right: -0.75rem;
    }
  }

  @media print {
    .header,
    .spacer {
      display: none;
    }
  }
</style>
