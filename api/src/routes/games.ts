/**
 * /api/games/* — minigame state (hangmaid word list, etc.)
 * Thin Elysia controller — delegates to services/games.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import { HangmaidQuery } from "@routes/schemas";
import { filterWords } from "@services/games/utils";
import type { WordEntry } from "@routes/types";

//import WORDS from "../words.json";
export const gamesRoutes = new Elysia({ tags: ["games"] })
  .use(authPlugin)
  .use(dbPlugin)

  .get("/games/hangmaid/words", ({ query }) =>
   // filterWords(WORDS as WordEntry[], query),
  { query: HangmaidQuery })

  .get("/minigames/hangmaid/words", ({ query }) =>
    //filterWords(WORDS as WordEntry[], query),
  { query: HangmaidQuery });
