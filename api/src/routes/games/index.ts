/**
 * /api/games/* — minigame state (hangmaid word list, etc.)
 * Thin Elysia controller — delegates to services/games.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";

//import WORDS from "../words.json";
export const gamesRoutes = new Elysia({ tags: ["games"] })
  .use(authPlugin)

  .get("/games/hangmaid/words", ({ query }) => {
    // TODO: filterWords(WORDS, query)
    return [];
  })

  .get("/minigames/hangmaid/words", ({ query }) => {
    // TODO: filterWords(WORDS, query)
    return [];
  });
