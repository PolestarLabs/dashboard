/**
 * /api/utils/* — miscellaneous utility endpoints.
 *
 * Migration status: STUB
 * Port from: src/routes/api/utils.js
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";

export const utilsRoutes = new Elysia({ prefix: "/api/utils", tags: ["utils"] })
  .use(dbPlugin)

  .get("/", async () => {
    return { _stub: true, message: "Not yet ported to Elysia" };
  });
