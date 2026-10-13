import { COMMITS_STAT } from "#lib/content/about.ts";

let count: Promise<number | null> | undefined;

/**
 * All-time public commit count from GitHub, fetched once per build (the home page and /about both show it); null
 * when GitHub can't be reached. Unauthenticated search allows 10 requests a minute; CI passes a token anyway.
 */
export function fetchCommitCount(): Promise<number | null> {
  count ??= (async () => {
    try {
      const token = globalThis.process?.env?.GITHUB_TOKEN;
      const response = await fetch(`https://api.github.com/search/commits?q=author:${COMMITS_STAT.user}&per_page=1`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "portfolio-site-build",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
      const { total_count } = (await response.json()) as { total_count: number };
      return total_count;
    } catch (error) {
      console.warn(`Couldn't fetch the GitHub commit count, using the fallback: ${error}`);
      return null;
    }
  })();
  return count;
}
