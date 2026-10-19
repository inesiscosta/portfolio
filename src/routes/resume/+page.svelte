<script lang="ts">
  import ChevronsUp from "@lucide/svelte/icons/chevrons-up";
  import Download from "@lucide/svelte/icons/download";
  import { confetti } from "#lib/attachments/confetti.ts";
  import FilterChips from "#lib/components/FilterChips.svelte";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import ResumeEntry from "#lib/components/resume/ResumeEntry.svelte";
  import ResumeLocation from "#lib/components/resume/ResumeLocation.svelte";
  import ResumePortrait from "#lib/components/resume/ResumePortrait.svelte";
  import ResumeSection from "#lib/components/resume/ResumeSection.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import { CV, CV_FOCUSES, type CvFocus } from "#lib/content/cv.ts";
  import { SITE, SOCIAL_LINKS } from "#lib/content/site.ts";
  import { withViewTransition } from "#lib/view-transition.ts";

  const SECTIONS = [
    { id: "experience", title: "Experience" },
    { id: "education", title: "Education" },
    { id: "skills", title: "Skills" },
    { id: "volunteering", title: "Volunteering" },
  ] as const;
  type SectionId = (typeof SECTIONS)[number]["id"];

  let open = $state<Record<SectionId, boolean>>({
    experience: true,
    education: true,
    skills: true,
    volunteering: true,
  });
  let visible = $state<Record<string, boolean>>({});
  let drawerOpen = $state(false);

  // Any number of focus areas; the experience bullets reorder and reword to lead with them (see #lib/tailor.ts).
  let focuses = $state<CvFocus[]>([]);
  const toggleFocus = (focus: CvFocus) =>
    withViewTransition(() => (focuses = focuses.includes(focus) ? focuses.filter((item) => item !== focus) : [...focuses, focus]));
  let scrollY = $state(0);

  const TOP_OF_PAGE = 120;
  const active = $derived(scrollY < TOP_OF_PAGE ? "experience" : (SECTIONS.find(({ id }) => visible[id])?.id ?? "experience"));

  const onvisible = (id: string, isVisible: boolean) => {
    visible[id] = isVisible;
  };

  function jumpTo(id: SectionId) {
    open[id] = true;
    drawerOpen = false;
  }
</script>

<svelte:window bind:scrollY />

<Seo title="Resume" description="The CV of {SITE.fullName}: experience, education, skills and volunteering." image="/og/resume.png" />

<header class="print-letterhead">
  <div>
    <h1>{CV.name}</h1>
    <p>{CV.title}</p>
  </div>
  <address>
    <a href="mailto:{CV.email}">{CV.email}</a>
    <span>{CV.location}</span>
    <a href={CV.website}>{CV.website.replace("https://", "")}</a>
  </address>
</header>

{#snippet tailor()}
  <div class="tailor">
    <p class="eyebrow-mono" aria-hidden="true">Tailor to</p>
    <FilterChips options={CV_FOCUSES} selected={focuses} label="Tailor the experience to" size="sm" onselect={toggleFocus} />
  </div>
{/snippet}

{#snippet links()}
  <div class="links">
    <a class="button primary" href={CV.pdf} download={CV.pdfName} {@attach confetti()}><Download size={14} aria-hidden="true" />Download PDF</a>
    <a class="button secondary" href={SOCIAL_LINKS.linkedin.href} target="_blank" rel="noopener noreferrer">View on LinkedIn</a>
  </div>
{/snippet}

<article class="container resume" data-pagefind-body data-pagefind-meta="title:Resume">
  <div class="sections">
    <!-- In the left column, so the sidebar (and the photo) start level with it. -->
    <div class="page-head">
      <PageHeader eyebrow={CV.header.eyebrow} title={CV.header.title} intro={CV.header.body} />
    </div>
    <ResumeSection id="experience" title="Experience" bind:open={open.experience} {onvisible}>
      <div class="entries">
        {#each CV.experience as entry, index (entry.organization)}
          <ResumeEntry {entry} last={index === CV.experience.length - 1} selected={focuses} />
        {/each}
      </div>
    </ResumeSection>

    <ResumeSection id="education" title="Education" bind:open={open.education} {onvisible}>
      <div class="entries">
        {#each CV.education as entry, index (entry.organization)}
          <ResumeEntry {entry} last={index === CV.education.length - 1} />
        {/each}
      </div>
    </ResumeSection>

    <ResumeSection id="skills" title="Skills" bind:open={open.skills} {onvisible}>
      <dl class="skills">
        {#each CV.skills as { group, items } (group)}
          <div>
            <dt>{group}</dt>
            <dd>{items.join(", ")}</dd>
          </div>
        {/each}
      </dl>
    </ResumeSection>


    <ResumeSection id="volunteering" title="Volunteering" bind:open={open.volunteering} {onvisible}>
      <div class="volunteering">
        {#each CV.volunteering as item (item.name)}
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        {/each}
      </div>
    </ResumeSection>
  </div>

  <aside class="sidebar">
    <div class="sidebar-portrait">
      <ResumePortrait src={CV.portrait.src} alt={CV.portrait.alt} />
    </div>
    <nav class="section-nav" aria-label="Resume sections">
      {#each SECTIONS as section (section.id)}
        <a href="#{section.id}" class:active={active === section.id} onclick={() => jumpTo(section.id)}>{section.title}</a>
      {/each}
    </nav>
    {@render links()}
    {@render tailor()}
    <ResumeLocation />
  </aside>
</article>

<p class="sr-only" aria-live="polite">{focuses.length > 0 ? `Experience tailored to ${focuses.join(", ")}.` : "Experience shown as written."}</p>

<footer class="drawer" class:open={drawerOpen}>
  <button type="button" class="drawer-toggle" aria-expanded={drawerOpen} onclick={() => (drawerOpen = !drawerOpen)}>
    <span class="sr-only">{drawerOpen ? "Hide" : "Show"} resume navigation</span>
    <ChevronsUp size={16} />
  </button>
  <div class="drawer-content">
    <nav class="drawer-nav" aria-label="Resume sections">
      {#each SECTIONS as section (section.id)}
        <a href="#{section.id}" class:active={active === section.id} onclick={() => jumpTo(section.id)}>{section.title}</a>
      {/each}
    </nav>
    <div class="drawer-side">
      {@render links()}
      {@render tailor()}
      <ResumeLocation />
    </div>
  </div>
</footer>

<style>
  /* The header's own bottom margin is replaced by the sections' gap. */
  .page-head :global(.page-header) {
    margin-bottom: 0;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.4375rem 0.875rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .primary {
    background: var(--button-primary);
    color: var(--button-primary-text);
  }

  .primary:hover,
  .primary:focus-visible {
    background: var(--button-primary-hover);
  }

  .secondary {
    border-color: var(--border-strong);
    color: var(--text-strong);
  }

  .secondary:hover,
  .secondary:focus-visible {
    border-color: var(--text-strong);
  }

  .resume {
    position: relative;
    display: grid;
    gap: 3rem;
    padding-bottom: var(--page-bottom);
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .skills {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 65ch;
  }

  dt {
    color: var(--text-strong);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  dd {
    margin-top: 0.25rem;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .volunteering {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 65ch;
  }

  .volunteering h3 {
    color: var(--text-strong);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .volunteering p {
    margin-top: 0.25rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .sidebar {
    display: none;
  }

  .section-nav,
  .drawer-nav {
    display: flex;
    flex-direction: column;
    font-size: 0.9375rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .section-nav a,
  .drawer-nav a {
    width: min-content;
    margin-left: -0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius);
    color: var(--text-muted);
    transition:
      background-color 0.1s,
      color 0.1s;
  }

  .section-nav a:hover,
  .section-nav a:focus-visible,
  .drawer-nav a:hover {
    background: var(--surface);
    color: var(--text-strong);
  }

  .section-nav a.active,
  .drawer-nav a.active {
    color: var(--accent-ink);
    font-weight: 600;
  }

  .tailor .eyebrow-mono {
    margin-bottom: 0.625rem;
    color: var(--text-subtle);
  }

  /* Mobile drawer pinned to the bottom of the screen. */
  .drawer {
    position: fixed;
    inset: auto 0 0;
    z-index: 40;
    max-height: 2.5rem;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-xl);
    transition: max-height 0.2s linear;
  }

  :global(.dark) .drawer {
    background: var(--gray-900);
  }

  .drawer.open {
    max-height: 18rem;
  }

  .drawer-toggle {
    position: absolute;
    top: 0;
    left: 50%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    background: inherit;
    color: var(--text);
    box-shadow: var(--shadow-lg);
    transform: translate(-50%, -50%);
  }

  .drawer-toggle :global(svg) {
    transition: transform 0.2s var(--ease);
  }

  .open .drawer-toggle :global(svg) {
    transform: rotate(180deg);
  }

  .drawer-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 2rem;
    padding-bottom: 1rem;
  }

  .drawer-side {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .print-letterhead {
    display: none;
  }

  @media (min-width: 1024px) {
    .resume {
      grid-template-columns: 1fr 200px;
    }

    /* A thin rule down the middle of the gap between the timeline and the sidebar, the full height of the page. */
    .resume::after {
      content: "";
      position: absolute;
      top: var(--page-top);
      right: calc(var(--gutter) + 200px + 1.5rem);
      bottom: 4rem;
      width: 1px;
      background: var(--border);
    }

    /* Starts where the page heading does, so the photo sits level with it. */
    .sidebar {
      position: sticky;
      top: calc(var(--header-height) + 2rem);
      margin-top: var(--page-top);
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-height: min-content;
      margin-bottom: auto;
    }

    .sidebar-portrait {
      padding: 1rem 0 0.5rem 0.75rem;
    }

    .drawer {
      display: none;
    }
  }

  @media print {
    .print-letterhead {
      display: flex;
      justify-content: space-between;
      width: 1024px;
      margin-inline: auto;
      padding-bottom: 1rem;
      color: var(--gray-900);
    }

    .print-letterhead h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .print-letterhead p {
      color: var(--gray-500);
      font-weight: 600;
    }

    .print-letterhead address {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      color: var(--gray-500);
      font-size: 0.9375rem;
      font-style: normal;
    }

    .resume {
      display: block;
      padding-block: 0;
      padding-left: 6rem;
    }

    .sidebar,
    .drawer {
      display: none;
    }

    .page-head {
      display: none;
    }

    dd,
    .volunteering p {
      font-size: 1rem;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
