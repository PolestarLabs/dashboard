/**
 * /api/generators/ship — ship graphic generation.
 * Thin Elysia controller — delegates to services/ship.
 */

import Elysia from "elysia";
import { ShipQuery } from "@routes/schemas";
import { generateShipCanvas } from "@routes/services/ship";

export const shipRoutes = new Elysia({ prefix: "/generators/ship", tags: ["generators"] })
  .get("/", async ({ query }) => {
    const png = await generateShipCanvas(query.av1, query.av2, query.spn, query.pct);
    return new Response(png, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  }, { query: ShipQuery });
