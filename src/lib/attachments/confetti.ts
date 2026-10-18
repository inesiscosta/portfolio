import type { Attachment } from "svelte/attachments";

/**
 * Bursts confetti from the element when it's clicked (skipped for visitors who prefer reduced motion).
 * party-js is only fetched on the first click, so it costs nothing on page load.
 * Usage: `<a {@attach confetti()}>`.
 */
export function confetti(count = 40): Attachment<HTMLElement> {
  return (node) => {
    const burst = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      import("party-js").then(({ confetti }) => confetti(node, { count }));
    };
    node.addEventListener("click", burst);
    return () => node.removeEventListener("click", burst);
  };
}
