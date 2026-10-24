<script lang="ts">
  import TagList from "#lib/components/writing/TagList.svelte";
  import { formatDate, isoDay, type PostMeta, postEyebrow, postHref } from "#lib/writing/post.ts";

  let { post }: { post: PostMeta } = $props();
</script>

<!-- The whole card is clickable through the title link's stretched ::after, so there's one link and no nested anchors. -->
<article class="card">
  <p class="eyebrow-mono">{postEyebrow(post)}</p>
  <h2 class="title"><a href={postHref(post.slug)}>{post.title}</a></h2>
  <p class="summary">{post.summary}</p>
  <TagList tags={post.tags} />
  <p class="meta">
    <time datetime={isoDay(post.date)}>{formatDate(post.date)}</time>
    <span aria-hidden="true">·</span>
    {post.readingTime} min read
  </p>
</article>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    background: var(--card);
    transition:
      translate 0.2s var(--ease),
      border-color 0.2s var(--ease),
      box-shadow 0.2s var(--ease);
  }

  .card:hover,
  .card:has(a:focus-visible) {
    translate: 0 -2px;
    border-color: var(--accent);
    box-shadow: var(--shadow-lg);
  }

  .title {
    color: var(--text-strong);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .title a::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  /* The card shows focus instead of the link. */
  .title a:focus-visible {
    outline: none;
  }

  .card:has(a:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .summary {
    color: var(--text);
    line-height: 1.6;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.25rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .card:hover,
    .card:has(a:focus-visible) {
      translate: none;
    }
  }
</style>
