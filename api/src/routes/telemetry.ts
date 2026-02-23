/**
 * /api/telemetry/* — bot cluster telemetry forwarding.
 *
 * Port from: src/routes/api/tele.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const telemetryRoutes = new Elysia({ prefix: "/api/telemetry", tags: ["telemetry"] })
  .use(authPlugin)
  .use(dbPlugin)

  // POST /api/telemetry/theme/:id?user=  — save selected dashboard theme
  .get("/theme/:id", async ({ params, query, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;

    if (!query.user || apiUser.id !== query.user) {
      set.status = 400;
      return "Bad Request: ?user= must match authenticated user";
    }

    await DB.users.set(query.user, {
      $set:  { "switches.dashTheme": params.id },
      $inc:  { [`counters.dashThemeClicks.${params.id}`]: 1 },
    });

    set.status = 204;
    return null;
  }, {
    params: t.Object({ id: t.String() }),
    query:  t.Object({ user: t.Optional(t.String()) }),
  });


import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";

export const telemetryRoutes = new Elysia({ prefix: "/api/telemetry", tags: ["telemetry"] })
  .use(dbPlugin)

  .all("/*", async () => ({ _stub: true, message: "Not yet ported to Elysia" }));
