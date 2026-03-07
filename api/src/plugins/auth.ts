/**
 * Auth plugin — bearer token authentication matching the Express API gate.
 *
 * API permissions hierarchy (same as Express):
 *   basic < trusted < sponsor < donor < admin < first_party < master
 *
 * Usage in route handlers:
 *   .use(authPlugin)
 *   .get("/protected", ({ bearer, requireAuth }) => { requireAuth(); ... })
 *
 * Per-route guards:
 *   requireAuth()         — any valid API token
 *   requireRole("admin")  — admin or higher
 */

import Elysia, { status } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { Schemas } from "@polestarlabs/database_schema";
import dbPlugin from "./db";

export type ApiPermission =
  | "basic"
  | "trusted"
  | "sponsor"
  | "donor"
  | "admin"
  | "first_party"
  | "master";

export interface ApiUser {
  id: string;
  apiKey: string;
  apiPermission: ApiPermission;
  ip: string;
  location: string;
}

const PERMISSION_RANK: Record<ApiPermission, number> = {
  basic:       0,
  trusted:     1,
  sponsor:     2,
  donor:       3,
  admin:       4,
  first_party: 5,
  master:      6,
};

export const authPlugin = new Elysia({ name: "auth" })
  .use(bearer())
  .use(dbPlugin)
  .derive({ as: "global" }, async ({ bearer: token, db }) => {
    // Resolve token → user from DB (same logic as Express passport-http-bearer)
    const dbConn = db as Schemas;
    const usersCollection = dbConn.users;

    let apiUser: ApiUser | null = null;

    if (token && usersCollection?.findOne) {
      const raw = await usersCollection.findOne({ apiKey: token }) as Record<string, unknown> | null;
      if (raw) {
        const personal = raw.personal as Record<string, string> | null;
        apiUser = {
          id:            String(raw.id ?? ""),
          apiKey:        String(raw.apiKey ?? ""),
          apiPermission: (raw.apiPerms as ApiPermission) ?? "basic",
          ip:            personal?.ip ?? "Unknown",
          location:      personal ? `${personal.city ?? ""}, ${personal.country ?? ""}` : "Unknown",
        };
      }
    }

    /** Throw 401 if there is no authenticated API user and return the user. */
    function requireAuth(): ApiUser {
      if (!apiUser) throw status(401, { message: "API Token required" });
      return apiUser;
    }

    /** Throw 403 if the user doesn't hold at least the given permission level. */
    function requireRole(min: ApiPermission): void {
      const user = requireAuth();
      if (PERMISSION_RANK[user.apiPermission] < PERMISSION_RANK[min]) {
        throw status(403, { message: "Insufficient API permissions" });
      }
    }

    return { apiUser, requireAuth, requireRole };
  });
