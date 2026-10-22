import type { Attachment } from "svelte/attachments";

const COPIED_FOR_MS = 1500;

/**
 * Wires up the copy buttons the markdown pipeline renders (hidden) on every code block inside the element.
 * They only appear once this runs, so readers without JS never see a button that does nothing.
 */
export const codeCopy: Attachment<HTMLElement> = (element) => {
  if (!navigator.clipboard) return;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const buttons = [...element.querySelectorAll<HTMLButtonElement>(".code-copy")];
  const handlers = buttons.map((button) => {
    const status = button.querySelector(".code-copied");
    const onclick = async () => {
      const code = button.closest(".code-block")?.querySelector("pre")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        return;
      }
      button.dataset.copied = "";
      if (status) status.textContent = "Copied";
      const timer = setTimeout(() => {
        delete button.dataset.copied;
        if (status) status.textContent = "";
        timers.delete(timer);
      }, COPIED_FOR_MS);
      timers.add(timer);
    };
    button.hidden = false;
    button.addEventListener("click", onclick);
    return () => button.removeEventListener("click", onclick);
  });

  return () => {
    for (const off of handlers) off();
    for (const timer of timers) clearTimeout(timer);
  };
};
