/**
 * /api/games/:game — minigame state (airline, blackjack, etc.)
 *
 * Migration status: STUB
 * Port from: src/routes/api/games/*.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const gamesRoutes = new Elysia({ tags: ["games"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET|POST /api/games/:game  and  /api/minigames/:game
  .all("/api/games/:game",     async ({ params }) => ({ _stub: true, message: "Not yet ported to Elysia", game: params.game }), {
    params: t.Object({ game: t.String() }),
  })
  .all("/api/minigames/:game", async ({ params }) => ({ _stub: true, message: "Not yet ported to Elysia", game: params.game }), {
    params: t.Object({ game: t.String() }),
  });
