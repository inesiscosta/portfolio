import { type CvFocus, type CvRole, SKILL_FOCUS } from "#lib/content/cv.ts";

type Tailored = {
  points: { text: string; relevant: boolean }[];
  skills: { name: string; relevant: boolean }[];
};

/**
 * A role as it reads when the visitor has picked some focus areas: points that speak to them come first (most matches
 * first, otherwise in their written order), and a point with a rewording for exactly one matching focus uses it.
 * Nothing is dropped. With no focus picked the role reads as written.
 */
export function tailorRole(role: CvRole, selected: readonly CvFocus[]): Tailored {
  const matches = (focus: readonly CvFocus[] | undefined) => (focus ?? []).filter((item) => selected.includes(item));

  const points = role.points.map((point) => {
    const hits = matches(point.focus);
    const only = hits.length === 1 ? hits[0] : undefined;
    return { text: (only && point.as?.[only]) || point.text, relevant: hits.length > 0, hits: hits.length };
  });
  const skills = (role.skills ?? []).map((name) => {
    const hits = matches(SKILL_FOCUS[name]);
    return { name, relevant: hits.length > 0, hits: hits.length };
  });

  const byRelevance = (a: { hits: number }, b: { hits: number }) => b.hits - a.hits;
  return {
    points: points.toSorted(byRelevance).map(({ text, relevant }) => ({ text, relevant })),
    skills: skills.toSorted(byRelevance).map(({ name, relevant }) => ({ name, relevant })),
  };
}
