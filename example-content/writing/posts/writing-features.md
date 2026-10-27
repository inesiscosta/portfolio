---
title: "A tour of the writing features"
subtitle: "Everything a post can do, in one post: copy what you need."
date: 2026-01-01
kind: write-up
tags: [Example, Writing]
summary: "Margin notes on both sides, a table of contents that gets out of their way, figures, maths, code pulled from real files, and your own components."
tldr: "Posts are Markdown with Svelte inside. The engine adds the table of contents, reading time, numbered notes and figures, code highlighting and maths; anything else, write as a component next to the post."
math: true
justify: true
---

<script>
  import Figure from "#lib/components/writing/Figure.svelte";
  import MarginNote from "#lib/components/writing/MarginNote.svelte";
  import Sidenote from "#lib/components/writing/Sidenote.svelte";
  import Counter from "./writing-features/Counter.svelte";
</script>

A post is a Markdown file in `posts/`, with frontmatter for its metadata and an optional `<script>` block for the components it uses. Its file name is its address: this one is `posts/writing-features.md`, at `/writing/writing-features`.

## Frontmatter

Only `title`, `date`, `kind` and `summary` are required.<Sidenote>Every field is checked when the site builds, so a typo fails the build with the file and the field named instead of quietly publishing something wrong.</Sidenote> The rest:

- `subtitle`, shown under the title.
- `updated`, a second date for revised posts.
- `kind`: `write-up` or `note`.
- `tags`, a list.
- `tldr`, a summary box at the top, like the one above.
- `featured: true` pins the post first on the Writing page.
- `draft: true` keeps it out of builds; it still shows in `pnpm dev`, marked as a draft.
- `math: true` loads the maths fonts; `justify: true` justifies the body text.

## Notes in the margins

### Sidenotes

A sidenote is numbered and sits right after the word it annotates,<Sidenote>Like this. On narrow screens it folds into the text instead; tap the number to open it.</Sidenote> written on one line: `word<Sidenote>note</Sidenote>`. Put it on the left with `side="left"`,<Sidenote side="left">A left sidenote. If it lands level with the table of contents, the contents slide out of its way until it has passed.</Sidenote> and nudge it with `offset="1rem"` if two collide.

### Margin notes

<MarginNote side="left">

A margin note takes whole blocks, code included:

```python
print("hello")
```

</MarginNote>

A margin note is unnumbered and takes any Markdown: lists, code, images. Put it on its own line with blank lines around it, just before the paragraph it belongs beside, and it top-aligns with that paragraph. It goes right by default; this one is on the left.

## Figures

<Figure caption="A figure gets a number and a caption, and can be anything: an image, an SVG, a component.">
  <svg viewBox="0 0 320 80" role="img" aria-label="Three boxes joined by arrows">
    <g fill="none" stroke="currentColor" stroke-width="2">
      <rect x="10" y="20" width="70" height="40" rx="6" /><rect x="125" y="20" width="70" height="40" rx="6" /><rect x="240" y="20" width="70" height="40" rx="6" />
      <path d="M80 40h45M195 40h45" />
    </g>
  </svg>
</Figure>

Figures are numbered in order, so a link like [Figure 1](#figure-1) always points at the right one.

## Code

Fences get syntax highlighting in light and dark, a language label and a copy button:

```typescript
const greet = (name: string) => `Hello, ${name}!`;
```

A fence can also pull a function out of a real file in `static/`, so the post never drifts from the code. This one is written as ` ```python file=examples/fib.py def=fib `, and its line numbers start where the function does:

```python file=examples/fib.py def=fib
```

## Maths

With `math: true`, write inline maths like $F_n = F_{n-1} + F_{n-2}$, and display maths on its own:

$$
F_n = \frac{\varphi^n - \psi^n}{\sqrt 5}
$$

## Your own components

Anything else is a Svelte component. Keep one next to the post that uses it (`posts/writing-features/Counter.svelte`), or in `components/` when several posts share it:

<Counter />

And when something needs a whole page, like an app a post walks through, put it in `pages/`: `pages/playground.svelte` is served at [/playground](/playground).
