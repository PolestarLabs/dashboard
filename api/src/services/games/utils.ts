/**
 * services/games.ts — Game utility logic, decoupled from Elysia.
 */

import { shuffle } from "utils/shuffle";

export interface WordEntry {
  word: string;
  theme: string;
  level: number;
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
