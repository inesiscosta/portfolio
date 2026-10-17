/*
  Lays projects out on a 12-column bento grid, the same way on the home page and on /projects.

  Projects with a screenshot (or highlighted) are "big": half-row tiles with the image beside the text. An odd
  big one out shares its row with the next two big ones as image-on-top quarter tiles, so rows always fill.
  Everything else is "small": compact tiles three to a row; a lone leftover joins the row before it as four
  across, or, if it's the only small one, runs the full width as a strip.
*/

import type { Project } from "#lib/content/projects.ts";

export type BentoVariant = "row" | "stack" | "compact";
type BentoCell = { project: Project; span: number; variant: BentoVariant };

const isBig = (project: Project) => Boolean(project.image) || project.highlight === true;

export function bento(projects: Project[]): BentoCell[] {
  const big = projects.filter(isBig);
  const small = projects.filter((project) => !isBig(project));
  const cells: BentoCell[] = [];

  const pairs = big.length % 2 === 0 || big.length < 3 ? big.length : big.length - 3;
  for (const project of big.slice(0, pairs)) cells.push({ project, span: 6, variant: "row" });
  if (pairs < big.length) {
    const [half, ...quarters] = big.slice(pairs);
    if (half) cells.push({ project: half, span: 6, variant: "row" });
    for (const project of quarters) cells.push({ project, span: 3, variant: "stack" });
  }

  let rest = small;
  if (big.length === 1) {
    const beside = rest.slice(0, 2);
    rest = rest.slice(beside.length);
    for (const project of beside) cells.push({ project, span: 6 / beside.length, variant: beside.length === 2 ? "stack" : "compact" });
  }

  const leftover = rest.length % 3;
  rest.forEach((project, index) => {
    const inLastRow = index >= rest.length - leftover;
    let span = 4;
    if (leftover === 2 && inLastRow) span = 6;
    if (leftover === 1) span = rest.length === 1 ? 12 : index >= rest.length - 4 ? 3 : 4;
    cells.push({ project, span, variant: "compact" });
  });

  return cells;
}
