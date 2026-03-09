/**
 * /api/telemetry/* — bot cluster telemetry forwarding.
 * Thin Elysia controller — delegates to services/telemetry.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { saveTheme } from "@services/telemetry";

export const telemetryRoutes = new Elysia({ prefix: "/telemetry", tags: ["telemetry"] })
  .use(authPlugin)

  .get("/theme/:id", async ({ params, query, requireAuth, set }) => {
    const apiUser = requireAuth();
    if (!query.user || apiUser.id !== query.user) {
      set.status = 400;
      return "Bad Request: ?user= must match authenticated user";
    }
    await saveTheme(params.id, query.user);
    set.status = 204;
    return null;
  });
