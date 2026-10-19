<script lang="ts">
  import type { CvEntry, CvFocus, CvRole } from "#lib/content/cv.ts";
  import { tailorRole } from "#lib/tailor.ts";

  let { entry, last = false, selected = [] }: { entry: CvEntry; last?: boolean; selected?: readonly CvFocus[] } = $props();

  const formatMonth = (value: string) =>
    new Date(`${value}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  const formatEnd = (value: string | null) => (value ? formatMonth(value) : "Present");

  // The rail shows the whole time at the organisation: the earliest start to the latest end ("YYYY-MM" sorts as text).
  const from = $derived(formatMonth(entry.roles.map((role) => role.from).toSorted()[0] ?? ""));
  const to = $derived(
    formatEnd(
      entry.roles.some((role) => role.to === null)
        ? null
        : (entry.roles
            .map((role) => role.to ?? "")
            .toSorted()
            .at(-1) ?? null),
    ),
  );
  // One role reads like before (title, then organisation); several are grouped under the organisation, like LinkedIn.
  const grouped = $derived(entry.roles.length > 1);
</script>

{#snippet grade(role: CvRole)}
  {#if role.grade}
    <span class="grade">{role.grade}</span>
  {/if}
{/snippet}

{#snippet details(role: CvRole)}
  {@const tailored = tailorRole(role, selected)}
  {#if tailored.points.length > 0}
    <ul>
      {#each tailored.points as point, index (index)}
        <li class:relevant={point.relevant}>{point.text}</li>
      {/each}
    </ul>
  {/if}
  {#if tailored.skills.length > 0}
    <p class="skills">
      <strong>Skills:</strong>
      {#each tailored.skills as skill, index (skill.name)}<span class:relevant={skill.relevant}>{skill.name}</span>{index < tailored.skills.length - 1 ? ", " : ""}{/each}
    </p>
  {/if}
{/snippet}

<section class="entry">
  <aside class="rail" aria-hidden="true">
    <span class="dates">
      <span>{from}<span class="dash"> –</span></span>
      <span>{to}</span>
    </span>
    <span class="dot"><i></i></span>
    <span class="line" class:last></span>
  </aside>

  <div class="body">
    {#if grouped}
      <h3>
        <strong>{entry.organization}</strong>
        <span class="meta"><span class="location">{entry.location}</span></span>
        <span class="inline-dates">{from} – {to}</span>
      </h3>
      <div class="roles">
        <!-- Like a git branch: the roles fork inwards off the timeline and merge back once they end. -->
        <svg class="fork" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 C0 0.6 1 0.4 1 1" /></svg>
        <svg class="merge" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><path d="M1 0 C1 0.6 0 0.4 0 1" /></svg>
        {#each entry.roles as role (role.title + role.from)}
          <section class="role">
            <div class="heading-row">
              <h4>
                <span class="role-title">{role.title}</span>
                <span class="role-dates">{formatMonth(role.from)} – {formatEnd(role.to)}</span>
              </h4>
              {@render grade(role)}
            </div>
            {@render details(role)}
          </section>
        {/each}
      </div>
    {:else if entry.roles[0]}
      <div class="heading-row">
        <h3>
          <strong>{entry.roles[0].title}</strong>
          <span class="meta">
            <span class="organization">{entry.organization}</span>
            <span class="separator" aria-hidden="true">-</span>
            <span class="location">{entry.location}</span>
          </span>
          <span class="inline-dates">{from} – {to}</span>
        </h3>
        {@render grade(entry.roles[0])}
      </div>
      {@render details(entry.roles[0])}
    {/if}
  </div>
</section>

<style>
  .entry {
    position: relative;
    display: flex;
    break-inside: avoid-page;
  }

  .rail {
    position: absolute;
    top: 0.25rem;
    left: 4.5rem;
    display: none;
    height: 100%;
  }

  .dates {
    position: absolute;
    top: 0;
    right: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-right: 1.5rem;
    color: var(--text-subtle);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 16px;
    text-align: right;
    white-space: nowrap;
  }

  .dash {
    display: none;
  }

  .dot {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    width: 1rem;
    height: 1rem;
    border-radius: var(--radius-full);
    background: var(--accent-soft);
    transform: translateX(-50%);
  }

  .dot i {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--radius-full);
    background: var(--accent-strong);
  }

  :global(.dark) .dot i {
    background: var(--accent);
  }

  .line {
    position: absolute;
    top: 1.5rem;
    left: 0;
    width: 2px;
    height: calc(100% - 2px);
    /* The timeline, its branches and the role rings all share --line, in both themes. */
    background: var(--line);
    transform: translateX(-50%);
  }

  .line.last {
    background: linear-gradient(var(--line), transparent);
  }

  .body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  h3 {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    letter-spacing: -0.01em;
  }

  h3 strong {
    color: var(--text-strong);
    font-size: 1.0625rem;
    font-weight: 700;
  }

  .heading-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  /* Ends where the section's dashed rule ends, not under its chevron (--rule-end comes from ResumeSection). */
  .grade {
    flex-shrink: 0;
    margin-right: var(--rule-end, 0px);
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.5rem;
  }

  .organization {
    color: var(--text);
    font-weight: 600;
  }

  .location {
    color: var(--text-subtle);
  }

  .separator {
    color: var(--line);
    user-select: none;
  }

  .inline-dates {
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  /* Roles at one organisation sit on a branch: it forks inwards off the timeline (--to-main is the distance back to it),
     each role is a commit on it, and it merges back after the last one. */
  .roles {
    --branch: var(--line);
    --fork-height: 1.25rem;
    --commit-y: 0.7rem;
    /* A stretch of straight branch between the fork and the first commit. */
    --fork-gap: 0.75rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.25rem;
    padding-left: 1.25rem;
  }

  .roles::before {
    content: "";
    position: absolute;
    top: calc(var(--commit-y) - var(--fork-gap));
    bottom: var(--commit-y);
    left: 0;
    width: 2px;
    background: var(--branch);
    transform: translateX(-50%);
  }

  .fork,
  .merge {
    position: absolute;
    left: var(--to-main);
    display: none;
    width: calc(-1 * var(--to-main));
    height: var(--fork-height);
    overflow: visible;
  }

  .fork {
    top: calc(var(--commit-y) - var(--fork-gap) - var(--fork-height));
  }

  .merge {
    bottom: calc(var(--commit-y) - var(--fork-height));
  }

  path {
    fill: none;
    stroke: var(--branch);
    stroke-width: 2px;
    vector-effect: non-scaling-stroke;
  }

  .role {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* The commit: a hollow ring on the branch. */
  .role::before {
    content: "";
    position: absolute;
    top: calc(var(--commit-y) - 5px);
    left: calc(-1.25rem - 5px);
    width: 10px;
    height: 10px;
    border: 2px solid var(--branch);
    border-radius: var(--radius-full);
    background: var(--bg);
  }

  h4 {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.75rem;
  }

  .role-title {
    color: var(--text-strong);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .role-dates {
    color: var(--text-subtle);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  ul {
    padding-left: 1rem;
    list-style: disc outside;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  li {
    padding-left: 0.75rem;
  }

  li::marker {
    color: var(--text-subtle);
  }

  /* With a focus picked, the points and skills that speak to it stand out a little. */
  li.relevant {
    color: var(--text);
  }

  li.relevant::marker {
    color: var(--accent);
  }

  .skills .relevant {
    color: var(--accent-ink);
    font-weight: 600;
  }

  .skills {
    margin-top: 0.25rem;
    color: var(--text-muted);
    font-size: 0.8125rem;
  }

  .skills strong {
    color: var(--text);
    font-weight: 600;
  }

  @media (min-width: 768px) {
    .rail {
      display: block;
    }

    .body {
      margin-left: 6rem;
    }

    .inline-dates {
      display: none;
    }

    .roles {
      --to-main: -1.5rem;
    }

    .fork,
    .merge {
      display: block;
    }
  }

  @media (min-width: 1280px) {
    .rail {
      left: 1.5rem;
    }

    .body {
      margin-left: 3.5rem;
    }

    .roles {
      --to-main: -2rem;
    }

    .dates {
      padding-right: 2rem;
    }

    .dash {
      display: inline;
    }
  }

  @media print {
    .rail {
      display: block;
      left: 1rem;
    }

    .dates {
      padding-right: 2rem;
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .dash {
      display: inline;
    }

    .body {
      margin-left: 3rem;
    }

    .roles {
      --to-main: -2rem;
    }

    .fork,
    .merge {
      display: block;
    }

    .inline-dates {
      display: none;
    }

    ul {
      font-size: 1rem;
    }
  }
</style>
