<script lang="ts">
  import { isCurrentNav, NAV } from "#lib/content/site.ts";
  import { page } from "$app/state";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  // The menu covers the page, so the page underneath shouldn't scroll while it's open.
  $effect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    // Widening past the breakpoint hides the menu, so close it too and give the page its scroll back.
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (desktop.matches) open = false;
    };
    desktop.addEventListener("change", close);
    return () => {
      document.documentElement.style.overflow = "";
      desktop.removeEventListener("change", close);
    };
  });
</script>

<svelte:window onkeydown={(event) => event.key === "Escape" && (open = false)} />

<div class="mobile-nav" class:open>
  <button type="button" class="burger" aria-expanded={open} aria-controls="mobile-menu" onclick={() => (open = !open)}>
    <span class="sr-only">{open ? "Close menu" : "Open menu"}</span>
    <span class="bars" aria-hidden="true"><i class="top"></i><i class="middle"></i><i class="bottom"></i></span>
  </button>

  <!-- Clips the panel at the header's bottom edge, so it slides out from under the bar rather than over it. -->
  <div class="clip">
    <nav id="mobile-menu" aria-label="Mobile" inert={!open}>
      {#each NAV as item, index (item.href)}
        <a
          href={item.href}
          style:--index={index}
          class:active={isCurrentNav(item, page.url.pathname)}
          aria-current={page.url.pathname === item.href ? "page" : undefined}
          onclick={() => (open = false)}
        >
          {item.title}
        </a>
      {/each}
    </nav>
  </div>
</div>

<style>
  .mobile-nav {
    display: block;
  }

  @media (min-width: 768px) {
    .mobile-nav {
      display: none;
    }
  }

  .burger {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-right: -0.375rem;
    border-radius: var(--radius);
    color: var(--text-strong);
  }

  .burger:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Three equal bars 5px apart; opening, the outer two slide to the middle and turn into an X while the middle one
     fades. HTML bars rather than SVG lines, whose rotation origin browsers place inconsistently. */
  .bars {
    position: relative;
    width: 1.125rem;
    height: 0.75rem;
  }

  .bars i {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
    transition:
      transform 0.3s var(--ease),
      opacity 0.2s var(--ease);
  }

  .top {
    top: 0;
  }

  .middle {
    top: calc(50% - 1px);
  }

  .bottom {
    bottom: 0;
  }

  .open .top {
    transform: translateY(5px) rotate(45deg);
  }

  .open .middle {
    opacity: 0;
  }

  .open .bottom {
    transform: translateY(-5px) rotate(-45deg);
  }

  .clip {
    position: fixed;
    inset: var(--header-height) 0 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
  }

  nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.25rem 0 2rem;
    overflow-y: auto;
    border-top: 1px solid var(--border);
    background: var(--bg);
    pointer-events: auto;
    transform: translateY(-100%);
    visibility: hidden;
    /* Closing: slide up, then hide once out of sight. */
    transition:
      transform 0.28s cubic-bezier(0.4, 0, 1, 1),
      visibility 0s linear 0.28s;
  }

  .open nav {
    transform: translateY(0);
    visibility: visible;
    /* Opening: show at once, then slide down and settle. */
    transition:
      transform 0.34s cubic-bezier(0.2, 0.8, 0.2, 1),
      visibility 0s;
  }

  /* Like apple.com's menu: large links that drop a few pixels into place as they fade in, one after another, once
     the panel is on its way; closing, they all fade out together and fast. */
  a {
    padding: 0.5rem max(1.5rem, var(--edge-inset));
    color: var(--text-strong);
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.015em;
    opacity: 0;
    transform: translateY(-0.5rem);
    transition:
      color 0.15s,
      opacity 0.12s ease,
      transform 0.12s ease;
  }

  .open a {
    opacity: 1;
    transform: none;
    transition:
      color 0.15s,
      opacity 0.3s ease calc(0.1s + var(--index) * 0.03s),
      transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) calc(0.1s + var(--index) * 0.03s);
  }

  a:hover,
  a:focus-visible {
    color: var(--accent-ink);
  }

  a.active {
    color: var(--accent-ink);
  }
</style>
