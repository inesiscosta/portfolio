<script lang="ts">
  import { SITE, SOCIAL_LINKS } from "#lib/content/site.ts";

  const LINKS = [SOCIAL_LINKS.github, SOCIAL_LINKS.email, SOCIAL_LINKS.linkedin];

  // Pages are prerendered, so the server's value is the year of the last build; the browser corrects it to the
  // current year, so the footer rolls over on 1 January without a redeploy.
  let year = $state(new Date().getFullYear());
  $effect(() => {
    year = new Date().getFullYear();
  });
</script>

<footer class="footer">
  <div class="container inner">
    <p>&copy; {year} {SITE.name}</p>
    <nav class="links" aria-label="Elsewhere">
      {#each LINKS as link (link.name)}
        {@const external = link.href.startsWith("http")}
        <a href={link.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{link.name}</a>
      {/each}
    </nav>
  </div>
</footer>

<style>
  .inner {
    /* Full width, with the ends inset by a share of the window (see --edge-inset). */
    max-width: none;
    padding-inline: var(--edge-inset);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding-block: 2.5rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .links {
    display: flex;
    gap: 1.75rem;
  }

  .links a {
    transition: color 0.15s;
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--text-strong);
  }

  @media (min-width: 768px) {
    .inner {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  @media print {
    .footer {
      display: none;
    }
  }
</style>
