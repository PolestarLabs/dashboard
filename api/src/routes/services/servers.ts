/**
 * services/servers.ts — Server data assembly, decoupled from Elysia.
 */

type DB = Record<string, any>;

export async function getServerData(serverId: string, db: DB) {
  const [serverData, serverMetaData] = await Promise.all([
    db.servers.get(serverId),
    db.svMetaDB.get(serverId),
  ]);

  if (!serverData)     return { ok: false, status: 404, message: "Not in Database" };
  if (!serverMetaData) return { ok: false, status: 404, message: "No metadata in Database" };

  const payload: Record<string, unknown> = JSON.parse(JSON.stringify(serverData));
  payload.meta = JSON.parse(JSON.stringify(serverMetaData));
  payload.clientID = process.env.BOT_CLIENT_ID ?? null;
  return { ok: true, data: payload };
}
