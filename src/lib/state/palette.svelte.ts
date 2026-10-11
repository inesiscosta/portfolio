/*
  The command palette's open state, shared by the palette itself, the header button and the global shortcuts.
*/

export const palette = $state({
  open: false,
  /** Apple: the palette shows ⌘ rather than Ctrl in its hints. */
  mac: false,
});

/** Whatever had focus when the palette opened, so closing it can hand focus back. */
let opener: HTMLElement | null = null;

export function openPalette() {
  if (palette.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  palette.open = true;
}

export function closePalette() {
  if (!palette.open) return;
  palette.open = false;
  opener?.focus();
  opener = null;
}

export function togglePalette() {
  if (palette.open) closePalette();
  else openPalette();
}

export function detectPlatform() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  palette.mac = /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform ?? navigator.platform ?? "");
}
