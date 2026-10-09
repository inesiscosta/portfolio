<script lang="ts">
  import { SITE } from "#lib/content/site.ts";
  import { page } from "$app/state";

  type Article = {
    published: Date;
    modified?: Date;
    tags: string[];
  };

  let {
    title,
    description = SITE.description,
    image = "/og/home.png",
    article,
  }: {
    title?: string;
    description?: string;
    /** Absolute or root-relative URL of a 1200×630 link-preview image; the home card by default. */
    image?: string;
    /** Marks the page as an article (og:type, article:* tags and BlogPosting JSON-LD). */
    article?: Article;
  } = $props();

  // Crawlers read the prerendered <title>: the page's own name, without the site name appended. Once the page is open,
  // the browser tab always reads just the site name. Re-run on every navigation, since <svelte:head> rewrites the title.
  const pageTitle = $derived(title ?? SITE.name);

  $effect(() => {
    void pageTitle;
    document.title = SITE.name;
  });
  const canonical = $derived(new URL(page.url.pathname, SITE.url).href);
  const imageUrl = $derived(image && new URL(image, SITE.url).href);

  // JSON inside <script> must not be able to close the tag.
  const jsonLd = $derived(
    article &&
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url: canonical,
        mainEntityOfPage: canonical,
        datePublished: article.published.toISOString(),
        dateModified: (article.modified ?? article.published).toISOString(),
        keywords: article.tags.join(", "),
        image: imageUrl,
        author: { "@type": "Person", name: SITE.name, url: SITE.url },
      }).replace(/</g, "\\u003c"),
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content={article ? "article" : "website"} />
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  {#if imageUrl}
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={pageTitle} />
    <meta name="twitter:image" content={imageUrl} />
  {/if}
  <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
  {#if article}
    <meta property="article:published_time" content={article.published.toISOString()} />
    {#if article.modified}
      <meta property="article:modified_time" content={article.modified.toISOString()} />
    {/if}
    {#each article.tags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
    {@html `<script type="application/ld+json">${jsonLd}</script>`}
  {/if}
</svelte:head>
