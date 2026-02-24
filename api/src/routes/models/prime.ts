/**
 * models/prime.ts — Elysia validation schemas for /prime routes.
 */

import { t } from "elysia";

export const PrimeServerParams = t.Object({
  serverID: t.String(),
});

export const PatreonFinderParams = t.Object({
  finder: t.String(),
});

export const PatreonTopParams = t.Object({
  max: t.String(),
});

export const PatreonTotalParams = t.Object({
  scale: t.String(),
});

export const PatreonTotalQuery = t.Object({
  active: t.Optional(t.String()),
});
