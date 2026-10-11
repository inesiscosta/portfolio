/**
 * Scores `text` against `query` as a subsequence match (every query character, in order), favouring
 * matches at word starts and runs of consecutive characters. Null when it doesn't match at all.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const needle = query.toLowerCase().replace(/\s+/g, "");
  if (!needle) return 0;
  const haystack = text.toLowerCase();

  let score = 0;
  let position = -1;
  let previous = -2;
  for (const char of needle) {
    position = haystack.indexOf(char, position + 1);
    if (position === -1) return null;
    const wordStart = position === 0 || /[\s\-/(]/.test(haystack[position - 1] ?? "");
    score += 1 + (wordStart ? 3 : 0) + (position === previous + 1 ? 2 : 0);
    previous = position;
  }
  // Shorter texts with the same matches rank higher.
  return score - haystack.length * 0.01;
}
