import type { Attachment } from "svelte/attachments";

/**
 * Reports whether the element intersects the viewport, via IntersectionObserver.
 * Usage: `<section {@attach inView((visible) => (shown = visible), { rootMargin: "-45% 0px -25% 0px" })}>`.
 */
export function inView(onChange: (visible: boolean) => void, options?: IntersectionObserverInit): Attachment<Element> {
  return (node) => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) onChange(entry.isIntersecting);
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  };
}
