<!--
  Shows the theme you'd switch to: a moon in light mode, a sun in dark mode. Sun and moon sit on one wheel:
  going dark it turns anticlockwise (moon out, sun in), going light it turns back clockwise.
  Driven by the .dark class on <html>, which app.html sets before first paint, so the right icon shows immediately.
-->
<svg
  class="theme-icon"
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g class="sun">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </g>
  <path class="moon" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
</svg>

<style>
  /* Left out of the page crossfade (see app.css), so only its own turn shows, not a fading copy of the old icon. */
  .theme-icon {
    overflow: visible;
    view-transition-name: theme-icon;
  }

  .sun,
  .moon {
    transform-origin: center;
    transition:
      transform 0.3s var(--ease),
      opacity 0.2s var(--ease);
  }

  .sun {
    opacity: 0;
    transform: rotate(90deg) scale(0.6);
  }

  :global(.dark) .moon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.6);
  }

  :global(.dark) .sun {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .sun,
    .moon {
      transition: opacity 0.2s var(--ease);
    }
  }
</style>
