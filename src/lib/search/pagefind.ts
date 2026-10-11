/*
  Lazy client for the Pagefind index that `pnpm build` writes to /pagefind/. 
*/

type PagefindResultData = {
  url: string;
  excerpt: string;
  meta: { title?: string; date?: string; kind?: string };
  filters: { tag?: string[] };
};

type Pagefind = {
  init(): Promise<void>;
  search(query: string): Promise<{ results: { id: string; data(): Promise<PagefindResultData> }[] } | null>;
};

export type SearchResult = {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  isPost: boolean;
  date?: string;
  tags: string[];
};

let loading: Promise<Pagefind | null> | undefined;

export function loadPagefind(): Promise<Pagefind | null> {
  loading ??= (async () => {
    try {
      // A variable path keeps Vite from trying to resolve the file at build time; it only exists after `pagefind` runs.
      const path = "/pagefind/pagefind.js";
      const pagefind: Pagefind = await import(/* @vite-ignore */ path);
      await pagefind.init();
      return pagefind;
    } catch {
      return null;
    }
  })();
  return loading;
}

const cleanUrl = (url: string) => url.replace(/\/index\.html$/, "/").replace(/\.html(?=$|#)/, "");

export async function search(pagefind: Pagefind, query: string, limit: number): Promise<SearchResult[]> {
  const response = await pagefind.search(query);
  if (!response) return [];
  const data = await Promise.all(response.results.slice(0, limit).map(async (result) => ({ id: result.id, ...(await result.data()) })));
  const results = data.map((item) => ({
    id: item.id,
    url: cleanUrl(item.url),
    title: item.meta.title ?? cleanUrl(item.url),
    excerpt: item.excerpt,
    isPost: Boolean(item.meta.kind),
    date: item.meta.date,
    tags: item.filters.tag ?? [],
  }));
  return [...results.filter((result) => result.isPost), ...results.filter((result) => !result.isPost)];
}
