import type { Attachment } from "svelte/attachments";

/** Breathing room above and below the element before something counts as touching it. */
const CLEARANCE_PX = 24;

/**
 * Reports whether any element matching `selector` (inside `scope`) currently overlaps this element
 * vertically, while `media` matches. The post page uses it so the sticky table of contents can move out
 * of the way of a left margin note and come back once the note has scrolled past.
 *
 * Measure the element itself, not something you transform in response, or moving it would change the answer.
 */
export function giveWay(
  scope: () => ParentNode | null | undefined,
  selector: string,
  media: string,
  onchange: (overlapping: boolean) => void,
): Attachment<HTMLElement> {
  return (element) => {
    const query = matchMedia(media);
    let frame = 0;
    let last: boolean | undefined;

    const check = () => {
      frame = 0;
      let overlapping = false;
      if (query.matches) {
        const box = element.getBoundingClientRect();
        for (const other of scope()?.querySelectorAll(selector) ?? []) {
          const rect = other.getBoundingClientRect();
          if (rect.top < box.bottom + CLEARANCE_PX && rect.bottom > box.top - CLEARANCE_PX) {
            overlapping = true;
            break;
          }
        }
      }
      if (overlapping !== last) {
        last = overlapping;
        onchange(overlapping);
      }
    };

    const schedule = () => {
      frame ||= requestAnimationFrame(check);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    query.addEventListener("change", schedule);
    check();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      query.removeEventListener("change", schedule);
    };
  };
}
