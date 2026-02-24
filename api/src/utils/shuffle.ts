/**
 * utils/shuffle.ts — stand-alone Fisher‑Yates shuffle utility.
 *
 * Extracted from `utils/helpers.ts` so the module can be imported
 * individually without dragging in the entire helpers file.
 */

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
