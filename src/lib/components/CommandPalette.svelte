<!--
  Site-wide command palette: ⌘K / Ctrl+K, "/" outside text fields, or the ⌘ button in the header.
  Searches the Pagefind index (loaded on first open) and runs a few commands. A native <dialog> gives the
  focus trap, Esc and the backdrop; the input is an ARIA combobox over a single listbox of options.
-->
<script lang="ts">
  import CornerDownLeft from "@lucide/svelte/icons/corner-down-left";
  import FileText from "@lucide/svelte/icons/file-text";
  import Folder from "@lucide/svelte/icons/folder";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import Mail from "@lucide/svelte/icons/mail";
  import PenLine from "@lucide/svelte/icons/pen-line";
  import Rss from "@lucide/svelte/icons/rss";
  import Search from "@lucide/svelte/icons/search";
  import SunMoon from "@lucide/svelte/icons/sun-moon";
  import User from "@lucide/svelte/icons/user";
  import type { Component } from "svelte";
  import BrandIcon from "#lib/components/BrandIcon.svelte";
  import type { BrandIconData } from "#lib/content/brand-icons.ts";
  import { SITE, SOCIAL_LINKS } from "#lib/content/site.ts";
  import { fuzzyScore } from "#lib/search/fuzzy.ts";
  import { loadPagefind, type SearchResult, search } from "#lib/search/pagefind.ts";
  import { closePalette, detectPlatform, openPalette, palette, togglePalette } from "#lib/state/palette.svelte.ts";
  import { setTheme, theme } from "#lib/state/theme.svelte.ts";
  import { goto } from "$app/navigation";

  const RESULT_LIMIT = 8;
  const DEBOUNCE_MS = 150;

  type Command = {
    id: string;
    label: string;
    /** Extra words the fuzzy match also looks at. */
    keywords?: string;
    icon: Component | BrandIconData;
    run: (newTab: boolean) => void | Promise<void>;
  };

  type Option = { kind: "post" | "page"; id: string; result: SearchResult } | { kind: "command"; id: string; command: Command };

  let dialog = $state<HTMLDialogElement>();
  let input = $state<HTMLInputElement>();
  let query = $state("");
  let selected = $state(0);
  let results = $state<SearchResult[]>([]);
  let status = $state<"idle" | "loading" | "ready" | "unavailable">("idle");
  let searching = $state(false);
  let copied = $state(false);

  function visit(url: string, newTab: boolean) {
    if (newTab) {
      window.open(url, "_blank", "noopener");
      return;
    }
    closePalette();
    // The feed isn't a page, so it needs a real navigation.
    if (url.endsWith(".xml")) window.location.href = url;
    else goto(url);
  }

  const external = (url: string) => () => {
    window.open(url, "_blank", "noopener");
    closePalette();
  };

  const COMMANDS: Command[] = [
    { id: "about", label: "Go to About", keywords: "home me", icon: User, run: (tab) => visit("/about", tab) },
    { id: "projects", label: "Go to Projects", keywords: "work portfolio", icon: Folder, run: (tab) => visit("/projects", tab) },
    { id: "writing", label: "Go to Writing", keywords: "blog posts notes", icon: PenLine, run: (tab) => visit("/writing", tab) },
    { id: "resume", label: "Go to Resume", keywords: "cv", icon: FileText, run: (tab) => visit("/resume", tab) },
    { id: "theme", label: "Toggle theme", keywords: "dark light mode", icon: SunMoon, run: () => setTheme(!theme.dark) },
    {
      id: "email",
      label: "Copy email",
      keywords: `contact mail ${SITE.email}`,
      icon: Mail,
      run: async () => {
        try {
          await navigator.clipboard.writeText(SITE.email);
          copied = true;
          setTimeout(() => (copied = false), 1500);
        } catch {
          window.location.href = SOCIAL_LINKS.email.href;
        }
      },
    },
    { id: "github", label: "Open GitHub", keywords: "code", icon: SOCIAL_LINKS.github.icon, run: external(SOCIAL_LINKS.github.href) },
    { id: "linkedin", label: "Open LinkedIn", icon: SOCIAL_LINKS.linkedin.icon, run: external(SOCIAL_LINKS.linkedin.href) },
    { id: "feed", label: "Subscribe (Atom feed)", keywords: "rss atom feed", icon: Rss, run: (tab) => visit("/feed.xml", tab) },
  ];

  const commands = $derived.by(() => {
    if (!query.trim()) return COMMANDS;
    return COMMANDS.map((command) => ({ command, score: fuzzyScore(query, `${command.label} ${command.keywords ?? ""}`) }))
      .filter((entry): entry is { command: Command; score: number } => entry.score !== null)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.command);
  });

  const options: Option[] = $derived([
    ...results.map((result) => ({ kind: result.isPost ? ("post" as const) : ("page" as const), id: `result-${result.id}`, result })),
    ...commands.map((command) => ({ kind: "command" as const, id: `command-${command.id}`, command })),
  ]);

  const groups = $derived(
    (
      [
        ["post", "Posts"],
        ["page", "Pages"],
        ["command", "Commands"],
      ] as const
    )
      .map(([kind, label]) => ({ kind, label, items: options.filter((option) => option.kind === kind) }))
      .filter((group) => group.items.length > 0),
  );

  const activeId = $derived.by(() => {
    const option = options[selected];
    return option && `palette-${option.id}`;
  });
  const trimmed = $derived(query.trim());

  const announcement = $derived.by(() => {
    if (!trimmed) return "";
    if (status === "unavailable") return "Search isn't available in development.";
    if (searching) return "Searching…";
    return `${results.length} ${results.length === 1 ? "result" : "results"}${commands.length ? `, ${commands.length} commands` : ""}`;
  });

  // Open and close the native dialog with the shared state; load Pagefind the first time.
  $effect(() => {
    if (!dialog) return;
    if (palette.open && !dialog.open) {
      dialog.showModal();
      input?.focus();
      if (status === "idle") {
        status = "loading";
        loadPagefind().then((pagefind) => (status = pagefind ? "ready" : "unavailable"));
      }
    } else if (!palette.open && dialog.open) {
      dialog.close();
    }
  });

  // Debounced search; a newer query makes older responses irrelevant.
  let generation = 0;
  $effect(() => {
    const text = trimmed;
    const ready = status === "ready";
    const current = ++generation;
    if (!text || !ready) {
      results = [];
      searching = false;
      return;
    }
    searching = true;
    const timer = setTimeout(async () => {
      const pagefind = await loadPagefind();
      const found = pagefind ? await search(pagefind, text, RESULT_LIMIT) : [];
      if (current !== generation) return;
      results = found;
      searching = false;
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  });

  // Each new query starts back at the top.
  $effect(() => {
    void trimmed;
    selected = 0;
  });

  $effect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  });

  $effect(detectPlatform);

  function isTyping(target: EventTarget | null) {
    return target instanceof HTMLElement && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
  }

  function onGlobalKeydown(event: KeyboardEvent) {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      togglePalette();
    } else if (event.key === "/" && !palette.open && !isTyping(event.target) && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      openPalette();
    }
  }

  function activate(option: Option | undefined, newTab: boolean) {
    if (!option) return;
    if (option.kind === "command") option.command.run(newTab);
    else visit(option.result.url, newTab);
  }

  function onInputKeydown(event: KeyboardEvent) {
    const count = options.length;
    if (event.key === "ArrowDown" && count) {
      event.preventDefault();
      selected = (selected + 1) % count;
    } else if (event.key === "ArrowUp" && count) {
      event.preventDefault();
      selected = (selected - 1 + count) % count;
    } else if (event.key === "Enter") {
      event.preventDefault();
      activate(options[selected], event.metaKey || event.ctrlKey);
    }
  }

  function onClose() {
    // Esc closes the dialog natively; keep the shared state (and focus return) in step.
    closePalette();
    query = "";
  }

  // A click on the backdrop lands on the <dialog> element itself.
  function onDialogClick(event: MouseEvent) {
    if (event.target === dialog) closePalette();
  }

  const indexOf = (option: Option) => options.indexOf(option);
</script>

<svelte:window onkeydown={onGlobalKeydown} />

{#snippet icon(value: Component | BrandIconData)}
  {#if "path" in value}
    <BrandIcon icon={value} />
  {:else}
    {@const Icon = value}
    <Icon size={18} aria-hidden="true" />
  {/if}
{/snippet}

<dialog bind:this={dialog} class="palette" aria-label="Search and commands" onclose={onClose} onclick={onDialogClick}>
  <div class="panel">
    <div class="field">
      <Search size={18} aria-hidden="true" />
      <input
        bind:this={input}
        bind:value={query}
        onkeydown={onInputKeydown}
        type="text"
        role="combobox"
        aria-expanded={options.length > 0}
        aria-controls="palette-listbox"
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-label="Search posts and pages, or type a command"
        placeholder="Search or type a command…"
        autocomplete="off"
        spellcheck="false"
      />
      {#if searching || (trimmed && status === "loading")}
        <span class="spinner"><LoaderCircle size={16} aria-hidden="true" /></span>
      {/if}
    </div>

    <div class="body">
      {#if trimmed && status === "unavailable"}
        <p class="notice">Search index is built on <code>pnpm build</code> — run the preview to test search.</p>
      {:else if trimmed && !searching && status === "ready" && results.length === 0}
        <p class="notice">No results for “{trimmed}”.</p>
      {/if}

      <div id="palette-listbox" role="listbox" aria-label="Results">
        {#each groups as group (group.kind)}
          <div role="group" aria-labelledby="palette-group-{group.kind}">
            <p id="palette-group-{group.kind}" class="eyebrow-mono group-label" role="presentation">{group.label}</p>
            {#each group.items as option (option.id)}
              {@const index = indexOf(option)}
              <!-- svelte-ignore a11y_click_events_have_key_events -- the keyboard drives options through the combobox input (aria-activedescendant). -->
              <div
                id="palette-{option.id}"
                class="option"
                class:selected={index === selected}
                role="option"
                tabindex="-1"
                aria-selected={index === selected}
                onclick={(event) => activate(option, event.metaKey || event.ctrlKey)}
                onmousemove={() => (selected = index)}
              >
                {#if option.kind === "command"}
                  <span class="option-icon">{@render icon(option.command.icon)}</span>
                  <span class="option-title">
                    {option.command.id === "email" && copied ? "Copied to clipboard" : option.command.label}
                  </span>
                {:else}
                  <span class="option-icon"><FileText size={18} aria-hidden="true" /></span>
                  <span class="option-text">
                    <span class="option-title">{option.result.title}</span>
                    {#if option.kind === "post" && (option.result.date || option.result.tags.length)}
                      <span class="option-meta">{[option.result.date, ...option.result.tags].filter(Boolean).join(" · ")}</span>
                    {/if}
                    <!-- Pagefind's excerpt is the page's own text, escaped by Pagefind, with matches in <mark>. -->
                    <span class="option-excerpt">{@html option.result.excerpt}</span>
                  </span>
                {/if}
                {#if index === selected}
                  <span class="enter" aria-hidden="true"><CornerDownLeft size={14} /></span>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <p class="sr-only" aria-live="polite">{announcement}</p>

    <footer class="hints" aria-hidden="true">
      <span>↑↓ navigate</span>
      <span>·</span>
      <span>↵ open</span>
      <span>·</span>
      <span>{palette.mac ? "⌘" : "Ctrl"}↵ new tab</span>
      <span>·</span>
      <span>esc close</span>
    </footer>
  </div>
</dialog>

<style>
  .palette {
    width: min(40rem, calc(100% - 2rem));
    max-width: none;
    max-height: min(32rem, calc(100dvh - 8rem));
    margin: 12vh auto auto;
    padding: 0;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    background: var(--card);
    color: var(--text);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
  }

  .palette[open] {
    animation: palette-in 0.16s var(--ease);
  }

  .palette::backdrop {
    background: var(--backdrop);
    backdrop-filter: blur(2px);
  }

  @keyframes palette-in {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .palette[open] {
      animation: none;
    }
  }

  /* Phones: a full-width sheet from the top. */
  @media (max-width: 640px) {
    .palette {
      width: 100%;
      max-height: 85dvh;
      margin: 0 0 auto;
      border-width: 0 0 1px;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
  }

  .panel {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-muted);
  }

  input {
    flex: 1;
    min-width: 0;
    padding-block: 1rem;
    color: var(--text-strong);
    font-size: 1rem;
  }

  input::placeholder {
    color: var(--text-subtle);
  }

  input:focus-visible {
    outline: none;
  }

  .spinner {
    display: grid;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      rotate: 360deg;
    }
  }

  .body {
    flex: 1;
    min-height: 0;
    padding: 0.5rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .notice {
    padding: 0.75rem 0.75rem 0.5rem;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .notice code {
    font-family: var(--font-mono);
    font-size: var(--font-size-mono);
  }

  .group-label {
    padding: 0.75rem 0.75rem 0.375rem;
    color: var(--text-muted);
    font-size: 0.6875rem;
  }

  .option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--radius);
    color: var(--text);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .option.selected {
    background: var(--surface);
    color: var(--text-strong);
  }

  .option-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--text-muted);
  }

  .option-icon :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }

  .option.selected .option-icon {
    color: var(--accent-ink);
  }

  .option-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .option-title {
    flex: 1;
    color: var(--text-strong);
    font-weight: 500;
  }

  .option-meta {
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .option-excerpt {
    display: -webkit-box;
    overflow: hidden;
    color: var(--text-muted);
    font-size: 0.8125rem;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .option-excerpt :global(mark) {
    border-radius: 2px;
    background: var(--accent-soft);
    color: var(--text-strong);
    font-weight: 500;
  }

  .enter {
    align-self: center;
    color: var(--text-muted);
  }

  .hints {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
  }
</style>
