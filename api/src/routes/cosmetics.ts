/**
 * /api/cosmetics/* — cosmetic items (skins, medals, stickers, etc.)
 *
 * Migration status: STUB
 * Port from: src/routes/api/cosmetics.js
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";

export const cosmeticsRoutes = new Elysia({ prefix: "/api/cosmetics", tags: ["cosmetics"] })
  .use(dbPlugin)
  .use(redisPlugin)

  // GET /api/cosmetics  — list all
  .get("/", async ({ db, redis }) => {
    return { _stub: true, message: "Not yet ported to Elysia" };
  })

  // GET /api/cosmetics/:id
  .get("/:id", async ({ params }) => {
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  });
