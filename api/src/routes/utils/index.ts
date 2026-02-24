/**
 * /api/utils/* — misc utility endpoints + root-level routes from _main.js.
 *
 * Includes: discoin/currencies, achievements/:id, pid.
 * Port from: src/routes/api/utils.js + src/routes/api/_main.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const utilsRoutes = new Elysia({ prefix: "/", tags: ["utils"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/discoin/currencies
  .get("/discoin/currencies", async ({ db }) => {
    const DB = db as any;
    return DB.globals.find({ type: "discoin" }, { type: 0, _id: 0, data: 0 }).lean();
  })

  // GET /api/achievements/:id
  .get("/achievements/:id", async ({ params, db }) => {
    const DB = db as any;
    // user-level achievements branch kept stubbed — no aggregate logic yet
    if (params.id === "user") return {};
    return DB.achievements.get({ id: params.id });
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/pid — process id (useful for debugging cluster routing)
  .get("/pid", () => ({ pid: process.pid }));
