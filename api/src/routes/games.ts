/**
 * /api/games/:game — minigame state (hangmaid word list, etc.)
 *
 * Port from: src/routes/api/games/hangmaid.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

// Word list lives in the Express API sources — shared, not duplicated.
// Relative path: api/src/routes → dashboard/src/routes/api/games/words.json
import WORDS from "../../../src/routes/api/games/words.json";

interface WordEntry {
  theme?: string;
  level?: number;
  [key: string]: unknown;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const gamesRoutes = new Elysia({ tags: ["games"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/games/hangmaid/words?t=theme&l=level&q=count
  .get("/api/games/hangmaid/words", ({ query }) => {
    let words = (WORDS as WordEntry[]).filter((w) => {
      if (query.t && w.theme !== query.t) return false;
      if (query.l && w.level !== parseInt(query.l)) return false;
      return true;
    });
    if (query.q) words = shuffle(words).slice(0, parseInt(query.q));
    return words;
  }, {
    query: t.Object({
      t: t.Optional(t.String()),  // theme
      l: t.Optional(t.String()),  // level
      q: t.Optional(t.String()),  // quantity
    }),
  })

  // GET /api/minigames/hangmaid/words — alias
  .get("/api/minigames/hangmaid/words", ({ query }) => {
    let words = (WORDS as WordEntry[]).filter((w) => {
      if (query.t && w.theme !== query.t) return false;
      if (query.l && w.level !== parseInt(query.l)) return false;
      return true;
    });
    if (query.q) words = shuffle(words).slice(0, parseInt(query.q));
    return words;
  }, {
    query: t.Object({
      t: t.Optional(t.String()),
      l: t.Optional(t.String()),
      q: t.Optional(t.String()),
    }),
  });


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
