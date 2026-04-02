/**
 * Auth plugin — bearer token authentication.
 *
 * API permissions hierarchy:
 *   basic < trusted < sponsor < donor < admin < first_party < master
 *
 * Usage in route handlers:
 *   .use(authPlugin)
 *   .get("/protected", ({ requireAuth }) => { requireAuth(); ... })
 *   .get("/admin-only", ({ requireRole }) => { requireRole("admin"); ... })
 */

import Elysia, { status } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { db } from "./db";

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
  .derive({ as: "global" }, async ({ bearer: token }) => {
    let apiUser: ApiUser | null = null;

    if (token && db.users?.findOne) {
      const raw = await db.users.findOne({ apiKey: token }) as Record<string, unknown> | null;
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

    function requireAuth(): ApiUser {
      if (!apiUser) throw status(401, { message: "API Token required" });
      return apiUser;
    }

    function requireRole(min: ApiPermission): void {
      const user = requireAuth();
      if (PERMISSION_RANK[user.apiPermission] < PERMISSION_RANK[min]) {
        throw status(403, { message: "Insufficient API permissions" });
      }
    }

    return { apiUser, requireAuth, requireRole };
  });
