/*
  Per-render state for a post body, set by PostBody.svelte. Figures number themselves from it in render
  order (the same order on the server and when hydrating), and components read `feed` to emit plain markup
  for feed readers, which get the HTML without the site's CSS.
*/

import { createContext } from "svelte";

type PostRender = {
  figures: number;
  feed: boolean;
};

export const [getPostRender, setPostRender, hasPostRender] = createContext<PostRender>();
