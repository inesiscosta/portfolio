import { flushSync } from "svelte";

/**
 * Applies a state change inside a view transition, so elements with a view-transition-name glide from their old
 * place and size to the new one (and appear or disappear with a fade). Without browser support, or with reduced
 * motion, the change simply happens.
 */
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
