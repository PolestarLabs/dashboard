/**
 * /api/prime/* — Prime subscription management.
 *
 * Port from: src/routes/api/prime.js
 * Note: Patreon OAuth endpoints not yet ported — require Patreon token from config.
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

const PATREON_URL  = "https://patreon.com";
const CAMPAIGN_ID  = process.env.PATREON_CAMPAIGN  ?? "";
const PATREON_TOKEN = process.env.PATREON_TOKEN    ?? "";

async function getPatreonPayload(): Promise<any[]> {
  const url =
    `${PATREON_URL}/api/oauth2/v2/campaigns/${CAMPAIGN_ID}/members` +
    encodeURI(
      "?include=user,currently_entitled_tiers" +
      "&fields[member]=patron_status,email,campaign_lifetime_support_cents,currently_entitled_amount_cents,full_name,patron_status" +
      "&fields[user]=social_connections" +
      "&fields[tier]=amount_cents,discord_role_ids,title" +
      "&page[size]=1000"
    );

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${PATREON_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`Patreon HTTP ${resp.status}`);

  const { data, included } = (await resp.json()) as { data: any[]; included: any[] };

  return data
    .filter((m: any) => m.attributes?.patron_status !== "former_patron")
    .map((member: any) => {
      const payload = { ...member.attributes };
      const userData = included?.find(
        (i: any) => i.id === member.relationships?.user?.data?.id && i.type === "user"
      );
      payload.discord     = userData?.attributes?.social_connections?.discord?.user_id ?? null;
      payload.email       = member.attributes.email ?? null;
      payload.patreon_id  = member.relationships?.user?.data?.id ?? null;
      return payload;
    });
}

export const primeRoutes = new Elysia({ prefix: "/api/prime", tags: ["prime"] })
  .use(authPlugin)
  .use(dbPlugin)

  // DELETE /api/prime/:serverID — remove prime from server
  .delete("/:serverID", async ({ params, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;

    const userData = await DB.users.get({ id: apiUser.id, "prime.servers": params.serverID });
    if (!userData) { set.status = 403; return { error: "Server Prime sub belongs to someone else" }; }

    await DB.users.set(apiUser.id, { $pull: { "prime.servers": params.serverID } });
    // TODO: bot bridge — instruct premium clients to leaveGuild(serverID)
    return { success: true };
  }, {
    params: t.Object({ serverID: t.String() }),
  })

  // GET /api/prime/patreon/raw
  .get("/patreon/raw", async ({ requireRole }) => {
    requireRole("first_party");
    return getPatreonPayload();
  })

  // GET /api/prime/patreon/check/:finder  (alias: /checkUser/:finder)
  .get("/patreon/check/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return payload.find((u: any) => u.discord === params.finder || u.email === params.finder) ?? null;
  }, { params: t.Object({ finder: t.String() }) })

  .get("/checkUser/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return payload.find((u: any) => u.discord === params.finder || u.email === params.finder) ?? null;
  }, { params: t.Object({ finder: t.String() }) })

  // GET /api/prime/patreon/top/:max
  .get("/patreon/top/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    const max = Math.max(parseInt(params.max, 10), 10);
    return payload
      .filter((x: any) => x.patron_status === "active_patron")
      .sort((a: any, b: any) => b.campaign_lifetime_support_cents - a.campaign_lifetime_support_cents)
      .slice(0, max);
  }, { params: t.Object({ max: t.String() }) })

  // GET /api/prime/patreon/top/alltime/:max
  .get("/patreon/top/alltime/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    const max = Math.max(parseInt(params.max, 10), 10);
    return payload
      .sort((a: any, b: any) => b.campaign_lifetime_support_cents - a.campaign_lifetime_support_cents)
      .slice(0, max);
  }, { params: t.Object({ max: t.String() }) })

  // GET /api/prime/patreon/total/:scale
  .get("/patreon/total/:scale", async ({ params, query, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    const active = query.active !== "false";
    const filtered = active ? payload.filter((m: any) => m.patron_status === "active_patron") : payload;
    const total = filtered.reduce((acc: number, curr: any) =>
      acc + (params.scale === "month"
        ? curr.currently_entitled_amount_cents
        : curr.campaign_lifetime_support_cents), 0);
    return { parsed: `$ ${(total / 100).toFixed(2)}` };
  }, {
    params: t.Object({ scale: t.String() }),
    query:  t.Object({ active: t.Optional(t.String()) }),
  });
