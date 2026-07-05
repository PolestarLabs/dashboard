const config = require('../../config.js');

const ADMIN_ID = config.data_controller || '88120564400553984';

function isPolluxAdmin(req){
    return req?.user?.id === ADMIN_ID || req?.user?.id === config.data_controller;
}

function getActiveClient(gData, req){
    // On staging, always use the session-selected client — DB activeClients don't apply
    if (process.env.STAGING || process.env.NODE_ENV !== 'production') return req?.PLX ?? PLX;
    const activeIds = Array.isArray(gData?.activeClients) ? gData.activeClients : [];
    const entry = activeIds.map(id => polluxClients.get(id)).find(Boolean);
    if (entry) return entry.client;
    if (activeIds.length) {
        console.warn('[getActiveClient] missing loaded client for activeClients', { activeClients: activeIds, loadedClientIds: Array.from(polluxClients.keys()) });
    }
    return PLX;
}

// Try to find a client that can access the given guild by probing loaded clients.
const fetch = require('node-fetch');

function makeUserClient(token, userId){
    return {
        id: `user:${userId}`,
        async getRESTGuild(gid){
            // Try as OAuth Bearer first, then as Bot token if unauthorized
            let r = await fetch(`https://discord.com/api/v9/guilds/${gid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.status === 401) {
                r = await fetch(`https://discord.com/api/v9/guilds/${gid}`, { headers: { Authorization: `Bot ${token}` } });
            }
            if(!r.ok) throw new Error(`${r.status} ${r.statusText} on GET /guilds/${gid}`);
            return r.json();
        },
        async getRESTGuildRoles(gid){
            let r = await fetch(`https://discord.com/api/v9/guilds/${gid}/roles`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.status === 401) {
                r = await fetch(`https://discord.com/api/v9/guilds/${gid}/roles`, { headers: { Authorization: `Bot ${token}` } });
            }
            if(!r.ok) throw new Error(`${r.status} ${r.statusText} on GET /guilds/${gid}/roles`);
            return r.json();
        },
        async getRESTGuildChannels(gid){
            let r = await fetch(`https://discord.com/api/v9/guilds/${gid}/channels`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.status === 401) {
                r = await fetch(`https://discord.com/api/v9/guilds/${gid}/channels`, { headers: { Authorization: `Bot ${token}` } });
            }
            if(!r.ok) throw new Error(`${r.status} ${r.statusText} on GET /guilds/${gid}/channels`);
            return r.json();
        },
        async getRESTGuildMember(gid, uid){
            let r = await fetch(`https://discord.com/api/v9/guilds/${gid}/members/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.status === 401) {
                r = await fetch(`https://discord.com/api/v9/guilds/${gid}/members/${uid}`, { headers: { Authorization: `Bot ${token}` } });
            }
            if(!r.ok) throw new Error(`${r.status} ${r.statusText} on GET /guilds/${gid}/members/${uid}`);
            return r.json();
        }
    }
}

async function findWorkingClient(gData, guildId, req = {}, maxAttempts = 12){
    // try logged-in user's token first
    try {
        if (req?.user && DB && DB.userOAuth) {
            const oauth = await DB.userOAuth.get(req.user.id);
            const token = oauth?.discord?.accessToken || oauth?.discord?.accessToken;
            if (token) {
                const userClient = makeUserClient(token, req.user.id);
                console.info('[findWorkingClient] probing with user token', { user: req.user.id, guildId });
                try {
                    await userClient.getRESTGuild(guildId);
                    console.info('[findWorkingClient] user token can access guild', { user: req.user.id, guildId });
                    return userClient;
                } catch(e) {
                    console.warn('[findWorkingClient] user token cannot access guild', { user: req.user.id, guildId, error: e.message || String(e), name: e.constructor?.name });
                    // user token can't access guild — continue to bots
                }
            } else {
                console.info('[findWorkingClient] no user oauth token available', { user: req.user.id });
            }
        }
    } catch(err){
        // ignore and proceed
    }
    // Build cascading order: session-selected client (if any), then main, prime, then remaining flavored clients
    const ordered = [];
    const sessionId = req?.session?.activeClientId || req?.PLX?.id;
    if (sessionId) ordered.push(sessionId);

    // prefer config ordering: main, prime, then others
    const confIds = Array.isArray(config.clients) ? config.clients.map(c=>c.id) : [];
    const mainIndex = confIds.findIndex(id=> id === PLX.id || (config && config.clients && config.clients.find(c=>c.id===PLX.id)));
    // push unique in order: main, prime, others
    for (const cid of confIds) {
        if (!ordered.includes(cid)) ordered.push(cid);
    }

    // append any other loaded client ids not in config
    for (const id of Array.from(polluxClients.keys())) if (!ordered.includes(id)) ordered.push(id);

    const ids = ordered.slice(0, maxAttempts);
    for (const id of ids){
        const entry = polluxClients.get(id);
        const client = entry?.client || (id === PLX.id ? PLX : null);
        if (!client) {
            console.warn('[findWorkingClient] client not loaded, skipping', { id });
            continue;
        }
        const kind = (id === PLX.id) ? 'main' : (confIds.includes(id) ? 'configured' : 'loaded');
        console.info('[findWorkingClient] probing client', { id, kind, guildId, sessionSelected: req?.session?.activeClientId });
        try {
            await client.getRESTGuild(guildId);
            console.info('[findWorkingClient] client can access guild', { id, kind, guildId });
            return client;
        } catch (e){
            console.warn('[findWorkingClient] client cannot access guild', { id, kind, guildId, error: e.message || String(e), name: e.constructor?.name, stack: process.env.STAGING ? (e.stack || null) : undefined });
            continue;
        }
    }
    return null;
}

module.exports = { isPolluxAdmin, getActiveClient, findWorkingClient, ADMIN_ID };

// Attempt to compute the bot client's permissions in a guild for richer logging.
async function computeBotPermissions(client, guildId){
    if(!client) return { available: false, reason: 'no-client' };
    // user-made clients (user:<id>) won't have a bot user
    const botId = client.user?.id;
    if(!botId) return { available: false, reason: 'no-bot-user' };
    try {
        const [member, roles] = await Promise.all([
            client.getRESTGuildMember(guildId, botId).catch(e=>({error: e.message || String(e), name: e.constructor?.name})),
            client.getRESTGuildRoles(guildId).catch(e=>({error: e.message || String(e), name: e.constructor?.name})),
        ]);
        if (member?.error || roles?.error) {
            return { available: false, reason: 'fetch-failed', memberError: member?.error || null, rolesError: roles?.error || null };
        }
        // compute permission bitfield from member roles and role definitions
        let perm = 0n;
        const roleMap = new Map((roles || []).map(r=>[r.id, r]));
        for(const rid of (member.roles || [])){
            const r = roleMap.get(rid);
            if(!r) continue;
            const p = BigInt(r.permissions || r.permissionsRaw || 0);
            perm = perm | p;
        }
        return { available: true, botId, permissions: perm.toString(), roleCount: (member.roles||[]).length, roles: (member.roles||[]).slice(0,10) };
    } catch(err){
        return { available: false, reason: 'exception', error: err.message || String(err), name: err.constructor?.name };
    }
}

// re-export with new helper
module.exports.computeBotPermissions = computeBotPermissions;
