/**
 * services/games.ts — Game utility logic, decoupled from Elysia.
 */

import type { WordEntry } from "@routes/models/games";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function filterWords(
  words: WordEntry[],
  query: { t?: string; l?: string; q?: string },
): WordEntry[] {
  let filtered = words.filter((w) => {
    if (query.t && w.theme !== query.t) return false;
    if (query.l && w.level !== parseInt(query.l)) return false;
    return true;
  });
  if (query.q) filtered = shuffle(filtered).slice(0, parseInt(query.q));
  return filtered;
}
