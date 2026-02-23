/**
 * /api/telemetry/* — bot cluster telemetry forwarding.
 *
 * Migration status: STUB
 * Port from: src/routes/api/tele.js
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";

export const telemetryRoutes = new Elysia({ prefix: "/api/telemetry", tags: ["telemetry"] })
  .use(dbPlugin)

  .all("/*", async () => ({ _stub: true, message: "Not yet ported to Elysia" }));
