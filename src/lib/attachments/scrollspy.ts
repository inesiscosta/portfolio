import type { Attachment } from "svelte/attachments";

/**
 * Reports the id of the section being read: the last h2/h3 inside the element whose top has scrolled past
 * the upper part of the viewport. Progressive enhancement for the table of contents, whose plain links work
 * without it. An IntersectionObserver over a band near the top of the viewport tells us when a heading
 * crosses it; only then is the active heading recomputed.
 */
export function scrollspy(onchange: (id: string | undefined) => void): Attachment<HTMLElement> {
  return (element) => {
    const headings = [...element.querySelectorAll<HTMLElement>("h2[id], h3[id]")];
    if (headings.length === 0) return;

    const update = () => {
      const threshold = window.innerHeight * 0.35;
      let current: HTMLElement | undefined;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= threshold) current = heading;
        else break;
      }
      onchange((current ?? headings[0])?.id);
    };

    const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * 16 || 64;
    const observer = new IntersectionObserver(update, { rootMargin: `-${header}px 0px -65% 0px` });
    for (const heading of headings) observer.observe(heading);
    update();

    return () => observer.disconnect();
  };
}
