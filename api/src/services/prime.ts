/**
 * services/prime.ts — Patreon integration business logic, decoupled from Elysia.
 */

const PATREON_URL   = "https://patreon.com";
const CAMPAIGN_ID   = process.env.PATREON_CAMPAIGN  ?? "";
const PATREON_TOKEN = process.env.PATREON_TOKEN     ?? "";

export async function getPatreonPayload(): Promise<any[]> {
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

export function findPatron(payload: any[], finder: string) {
  return payload.find((u: any) => u.discord === finder || u.email === finder) ?? null;
}

export function topPatrons(payload: any[], max: number, activeOnly: boolean) {
  const filtered = activeOnly
    ? payload.filter((x: any) => x.patron_status === "active_patron")
    : payload;
  return filtered
    .sort((a: any, b: any) => b.campaign_lifetime_support_cents - a.campaign_lifetime_support_cents)
    .slice(0, max);
}

export function totalRevenue(payload: any[], scale: string, activeOnly: boolean) {
  const filtered = activeOnly
    ? payload.filter((m: any) => m.patron_status === "active_patron")
    : payload;
  const total = filtered.reduce((acc: number, curr: any) =>
    acc + (scale === "month"
      ? curr.currently_entitled_amount_cents
      : curr.campaign_lifetime_support_cents), 0);
  return { parsed: `$ ${(total / 100).toFixed(2)}` };
}

export async function removePrimeFromServer(userId: string, serverId: string, db: any) {
  const userData = await db.users.get({ id: userId, "prime.servers": serverId });
  if (!userData) return { ok: false, error: "Server Prime sub belongs to someone else" };
  await db.users.set(userId, { $pull: { "prime.servers": serverId } });
  return { ok: true };
}
