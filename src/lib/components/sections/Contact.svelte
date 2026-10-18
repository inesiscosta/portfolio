<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import Copy from "@lucide/svelte/icons/copy";
  import Mail from "@lucide/svelte/icons/mail";
  import Send from "@lucide/svelte/icons/send";
  import { confetti } from "#lib/attachments/confetti.ts";
  import { CONTACT } from "#lib/content/contact.ts";
  import { SITE, SOCIAL_LINKS } from "#lib/content/site.ts";

  const COPIED_MS = 2000;

  // The copy button flips to a tick for a moment after copying.
  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      copied = true;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => (copied = false), COPIED_MS);
    } catch {
      // Clipboard access can be blocked; the address is right there on the card to copy by hand.
    }
  }
</script>

<section id="contact" class="contact">
  <div class="container grid">
    <header class="intro">
      <p class="eyebrow-mono">{CONTACT.eyebrow}</p>
      <h2 class="heading-2xl">{CONTACT.heading} <strong>{CONTACT.highlight}</strong></h2>
      <p class="body">{CONTACT.body}</p>
      <ul class="topics" aria-label="Get in touch about">
        {#each CONTACT.topics as topic (topic.label)}
          <li><topic.icon size={16} aria-hidden="true" />{topic.label}</li>
        {/each}
      </ul>
    </header>

    <div class="card">
      <!-- A paper plane taking off from the top corner of the card, trailing a dashed path. -->
      <svg class="plane" viewBox="0 0 120 64" fill="none" aria-hidden="true">
        <path class="trail" d="M2 62 C 14 44, 34 40, 52 46 S 82 48, 88 26" />
        <path class="wing" d="M84 22 L118 4 L100 34 L94 24 Z M94 24 L118 4" />
      </svg>

      <div class="address">
        <span class="mail-icon" aria-hidden="true"><Mail size={28} /></span>
        <div class="address-text">
          <span class="label">Email me at</span>
          <a class="email" href={SOCIAL_LINKS.email.href}>{SITE.email}</a>
        </div>
      </div>

      <div class="actions">
        <a class="button send" href={SOCIAL_LINKS.email.href} {@attach confetti()}><Send size={16} aria-hidden="true" />Send an email</a>
        <button type="button" class="button copy" onclick={copyEmail}>
          <!-- Both labels share one grid cell so the button keeps the wider one's width when it flips. -->
          <span class="swap">
            <span class="copy-label" class:off={copied}><Copy size={16} aria-hidden="true" />Copy email</span>
            <span class="copy-label" class:off={!copied}><Check size={16} aria-hidden="true" />Copied</span>
          </span>
        </button>
      </div>
    </div>

    <div class="glow right" aria-hidden="true"></div>
    <div class="glow left" aria-hidden="true"></div>
  </div>
</section>

<style>
  .contact {
    position: relative;
    overflow: hidden;
    padding-block: var(--section-space);
    scroll-margin-top: var(--header-height);
  }

  .grid {
    position: relative;
    display: grid;
    gap: 3rem;
    align-items: center;
  }

  .heading-2xl strong {
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .body {
    max-width: 34rem;
    color: var(--text-muted);
    font-size: 1.125rem;
    letter-spacing: -0.01em;
  }

  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .topics li {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1.5rem;
    border: 1px solid var(--card-border);
    border-radius: 1.25rem;
    background: var(--card);
    box-shadow: var(--shadow-lg);
  }

  .plane {
    position: absolute;
    top: -2.75rem;
    right: 0.5rem;
    width: 7.5rem;
    color: var(--accent);
    pointer-events: none;
  }

  .trail {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-dasharray: 4 5;
    stroke-linecap: round;
    opacity: 0.7;
  }

  .wing {
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linejoin: round;
  }

  .address {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .mail-icon {
    flex-shrink: 0;
    color: var(--accent);
  }

  .address-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .label {
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .email {
    overflow: hidden;
    color: var(--text-strong);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .email:hover {
    color: var(--accent-strong);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .button {
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-lg);
    font-size: 0.9375rem;
    font-weight: 600;
    white-space: nowrap;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s,
      box-shadow 0.2s;
  }

  .send {
    border: 1px solid transparent;
    background: var(--button-primary);
    color: var(--button-primary-text);
  }

  .send:hover,
  .send:focus-visible {
    background: var(--button-primary-hover);
  }

  .copy {
    border: 1px solid var(--border-strong);
    color: var(--text-strong);
  }

  .copy:hover,
  .copy:focus-visible {
    border-color: var(--text-strong);
  }

  .swap {
    display: grid;
  }

  .copy-label {
    display: inline-flex;
    grid-area: 1 / 1;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
  }

  .copy-label.off {
    visibility: hidden;
  }

  /* Two soft blue hues behind the section: one under the card, one off the left edge. */
  .glow {
    position: absolute;
    z-index: -1;
    border-radius: var(--radius-full);
    background: radial-gradient(var(--accent-soft), transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }

  .right {
    right: -10%;
    bottom: -30%;
    width: 40%;
    height: 60%;
  }

  .left {
    bottom: -20%;
    left: -15%;
    width: 35%;
    height: 70%;
    background: radial-gradient(color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
  }

  @media (min-width: 640px) {
    .card {
      padding: 2rem;
    }

    .email {
      font-size: 1.5rem;
    }
  }

  /* As wide as the hero, so the heading gets two lines like the hero's. */
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: 1.1fr 1fr;
      gap: 4rem;
      max-width: var(--container-wide);
    }
  }
</style>
