/**
 * utils/search.ts — Shared search query builder for services.
 */

export function buildSearchQuery(
  query: Record<string, string | undefined>,
  allowedFields: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const k of allowedFields) {
    const v = query[k];
    if (v !== undefined) result[k] = v;
  }
  return result;
}
