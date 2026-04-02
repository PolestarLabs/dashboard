/**
 * /api/utils/* — misc utility endpoints + root-level routes.
 * Thin Elysia controller — delegates to services/utils.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { getDiscoinCurrencies, getAchievement } from "@services/misc";

export const utilsRoutes = new Elysia({ prefix: "/", tags: ["utils"] })
  .use(authPlugin)

  .get("/discoin/currencies", () =>
    getDiscoinCurrencies())

  .get("/achievements/:id", ({ params }) =>
    getAchievement(params.id))

  .get("/pid", () => ({ pid: process.pid }));
