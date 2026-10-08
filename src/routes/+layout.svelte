<script lang="ts">
  import "../app.css";
  import "@fontsource/jetbrains-mono/latin-400.css";
  import "@fontsource/jetbrains-mono/latin-500.css";
  import monoFont from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url";
  import type { Snippet } from "svelte";
  import CommandPalette from "#lib/components/CommandPalette.svelte";
  import Footer from "#lib/components/layout/Footer.svelte";
  import Header from "#lib/components/layout/Header.svelte";
  import { HOME_FOOTER } from "#lib/content/site.ts";
  import { WRITING } from "#lib/content/writing.ts";
  import { syncThemeFromDocument } from "#lib/state/theme.svelte.ts";
  import { page } from "$app/state";

  let { children }: { children: Snippet } = $props();

  $effect(() => syncThemeFromDocument());
</script>

<svelte:head>
  <link rel="preload" href={monoFont} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="alternate" type="application/atom+xml" title={WRITING.feedTitle} href="/feed.xml" />
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<Header />
<main id="main" tabindex="-1">
  {@render children()}
</main>
{#if page.url.pathname !== "/" || HOME_FOOTER.atEnd}
  <Footer />
{/if}
<CommandPalette />

<style>
  /* Off-screen until it's focused with the keyboard, then pinned over the header. */
  .skip {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 60;
    padding: 0.5rem 0.875rem;
    border-radius: var(--radius);
    background: var(--button-primary);
    color: var(--button-primary-text);
    font-size: 0.875rem;
    font-weight: 600;
    transform: translateY(-200%);
  }

  .skip:focus-visible {
    transform: none;
  }

  main {
    flex: 1;
    outline: none;
  }

  @media print {
    main {
      width: 1024px;
      margin-inline: auto;
    }
  }
</style>
