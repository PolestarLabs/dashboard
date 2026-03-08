/**
 * /api/games/adventure/* — Adventure game: locations, encounters, and journals.
 * Thin Elysia controller — no service layer yet.
 * TODO: create services/games/adventure.ts and implement the handlers below.
 *
 * Auth model (per draft):
 *   /locations/* and /encounters/*  → open (no auth required)
 *   /journals/*                     → user-only (self) or admin
 *
 * TBD routes (commented out in draft) are omitted until design is finalised:
 *   POST /locations/:locationID/travel
 *   POST /locations/:locationID/explore
 *   POST /encounters/:encounterID/resolve
 *   POST /journals/:userID/:entryID  (possibly internal-service only)
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import {
  AdventureLocationParams,
  AdventureEncounterParams,
  UserIDParam,
  AdventureJournalEntryParams,
} from "@routes/_schemas";

export const adventureRoutes = new Elysia({ prefix: "/games/adventure", tags: ["games", "adventure"] })
  .use(authPlugin)
  .use(dbPlugin)

  // ── Locations ──────────────────────────────────────────────────────────────

  // GET /games/adventure/locations/:locationID — location details (open)
  .get("/locations/:locationID", async ({ params, set }) => {
    // TODO: services/games/adventure.ts → getLocation(params.locationID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: AdventureLocationParams })

  // GET /games/adventure/locations/:locationID/routes — available exits (open)
  .get("/locations/:locationID/routes", async ({ params, set }) => {
    // TODO: services/games/adventure.ts → getLocationRoutes(params.locationID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: AdventureLocationParams })

  // GET /games/adventure/locations/:locationID/occupancy — current player count (open)
  .get("/locations/:locationID/occupancy", async ({ params, set }) => {
    // TODO: services/games/adventure.ts → getLocationOccupancy(params.locationID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: AdventureLocationParams })

  // ── Encounters ─────────────────────────────────────────────────────────────

  // GET /games/adventure/encounters/:encounterID — encounter details (open)
  .get("/encounters/:encounterID", async ({ params, set }) => {
    // TODO: services/games/adventure.ts → getEncounter(params.encounterID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: AdventureEncounterParams })

  // ── Journals ───────────────────────────────────────────────────────────────

  // GET /games/adventure/journals/:userID — a user's full journal (user-only / admin)
  .get("/journals/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/games/adventure.ts → getUserJournal(params.userID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam })

  // GET /games/adventure/journals/:userID/:entryID — a single journal entry (user-only / admin)
  .get("/journals/:userID/:entryID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/games/adventure.ts → getJournalEntry(params.userID, params.entryID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: AdventureJournalEntryParams });
