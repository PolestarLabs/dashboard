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

module.exports = { isPolluxAdmin, getActiveClient, ADMIN_ID };
