/**
 * /api/utils/* — misc utility endpoints + root-level routes.
 * Thin Elysia controller — delegates to services/utils.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import { AchievementParams } from "@routes/schemas";
import { getDiscoinCurrencies, getAchievement } from "@routes/services/misc";

export const utilsRoutes = new Elysia({ prefix: "/", tags: ["utils"] })
  .use(authPlugin)
  .use(dbPlugin)

  .get("/discoin/currencies", ({ db }) =>
    getDiscoinCurrencies(db as any))

  .get("/achievements/:id", ({ params, db }) =>
    getAchievement(params.id, db as any),
  { params: AchievementParams })

  .get("/pid", () => ({ pid: process.pid }));
