<script lang="ts">
  import Rss from "@lucide/svelte/icons/rss";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import PostCard from "#lib/components/writing/PostCard.svelte";
  import { WRITING } from "#lib/content/writing.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo title="Writing" description={WRITING.intro} image="/og/writing.png" />

<section class="container writing">
  <PageHeader eyebrow="Writing" title={WRITING.heading} intro={WRITING.intro} />

  {#if data.posts.length > 0}
    <!-- More than ~8 posts and this becomes a list per year; one grid is enough for now. -->
    <div class="grid">
      {#each data.posts as post (post.slug)}
        <PostCard {post} />
      {/each}
    </div>
  {:else}
    <p class="empty">Nothing here yet.</p>
  {/if}

  <a class="feed" href="/feed.xml"><Rss size={14} aria-hidden="true" /> Subscribe via Atom feed</a>
</section>

<style>
  .writing {
    padding-bottom: var(--page-bottom);
  }

  .grid {
    display: grid;
    gap: 1rem;
  }

  /* Every post is one cell (two to a row), so a single post sits at the size it will have once others join it. */
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .empty {
    color: var(--text-muted);
  }

  .feed {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2.5rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    transition: color 0.15s;
  }

  .feed:hover {
    color: var(--accent-ink);
  }
</style>
