/**
 * /api/relationships/* — user marriage / relationship data.
 * Thin Elysia controller — delegates to services/relationships.
 */

import Elysia from "elysia";
import { getRelationships } from "@services/relationships";

export const relationshipsRoutes = new Elysia({ prefix: "/relationships", tags: ["relationships"] })

  .get("/", async ({ query, set }) => {
    const result = await getRelationships(query);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  });
