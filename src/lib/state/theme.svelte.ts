/*
  Light/dark theme. The inline script in src/app.html applies the stored choice before first paint;
  this module keeps the reactive copy in sync and persists changes.
*/

export const theme = $state({ dark: false });

export function syncThemeFromDocument() {
  theme.dark = document.documentElement.classList.contains("dark");
}

export function setTheme(dark: boolean) {
  // Crossfade the whole page between themes where the browser supports view transitions.
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const root = document.documentElement;
    root.dataset.themeSwitching = "";
    document.startViewTransition(() => applyTheme(dark)).finished.finally(() => delete root.dataset.themeSwitching);
  } else {
    applyTheme(dark);
  }
}

function applyTheme(dark: boolean) {
  theme.dark = dark;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the theme still applies for this visit.
  }
}
