# Example content

Placeholder content so this repo builds without the private content repo. `pnpm dev` and `pnpm build` copy it into
`src/content/` when that folder is missing; the real site's content is a private repo cloned there instead.

- `about.yaml`, `timeline.yaml`, `resume.yaml`, `projects.yaml`: checked against `src/lib/content/schema.ts`.
- `writing/*.md`: posts, with the frontmatter checked in `src/lib/writing/posts.server.ts`.
- Photos and the CV PDF are keys in the R2 bucket (or full URLs, as here).
