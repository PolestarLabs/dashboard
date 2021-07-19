const axios = require("axios");
const config = require("../../../config.js");
const express = require("express");
const { checkAuth } = require("../../pipelines/globalFunctions.js");
const router = express.Router();

const PATREON_URL = "https://patreon.com";
const CAMPAIGN_ID = config.patreon.campaign;
const PATREON_TOKEN = config.patreon.token;



// GENERIC


router.delete("/:serverID", async (req, res) => {
    const userID = req.user?.id;
    if (!userID) return res.status(401).json({error: "Unauthorized"});
    
    const {serverID} = req.params;
    
    const userData = await DB.users.get({id: userID, "prime.servers": serverID});
    if (!userData) return res.status(403).json({error: "Server Prime sub belongs to someone else"});
    
    await DB.users.set(userID, {$pull: {"prime.servers": serverID }});
    if (polluxClients){
        Array.from(polluxClients, ([,{client,user}]) => {
          if (client.category === "premium" && serverID !== config.official_guild){            
            client.leaveGuild(serverID).catch(er=>{});
          }
        })        
    }
    return res.status(200).json({success: true});

})



// PATREON ENDPOINTS
router.get(/\/patreon\/.*/, async (req,res,next)=>{
    try{        
        
        req.patreon_payload = await getPatreonPayload(req);
        next();

    }catch(err){
        res.status(500).send("ERROR")
    }


});
router.get("/patreon/raw", async (req,res)=>{
    res.json(req.patreon_payload);
});
router.get(["/patreon/check/:finder","/checkUser/:finder"], async (req,res)=>{
    const {finder} = req.params;
    const patreonPayload = req.patreon_payload || await getPatreonPayload(req);
    const result = patreonPayload?.find(user=>user.discord === finder || user.email === finder);
    res.json( result );
});
router.get("/patreon/top/:max", async (req,res)=>{
    const DATA = req.patreon_payload;
    const max = Math.max(req.params.max, 10);
    const parsed = DATA.sort(({campaign_lifetime_support_cents:a},{campaign_lifetime_support_cents:b})=>{return b-a}).filter(x=>x.patron_status==="active_patron").slice(0,max)
    res.json(parsed);
});
router.get("/patreon/top/alltime/:max", async (req,res)=>{
    const DATA = req.patreon_payload;
    const max = Math.max(req.params.max, 10);
    const parsed = DATA.sort(({campaign_lifetime_support_cents:a},{campaign_lifetime_support_cents:b})=>{return b-a}).slice(0,max)
    res.json(parsed);
});
router.get("/patreon/total/:scale", async (req,res)=>{
    const {scale} = req.params;
    const DATA = req.patreon_payload.filter(m=>{
        return req.query.active ?? true;
        return true;
    });

    const parsed = "$ "+(DATA.reduce((acc,curr,i)=>{
        return acc + ( scale === 'month' ? curr.currently_entitled_amount_cents : curr.campaign_lifetime_support_cents)
    },0)/100)

    res.json({parsed});
});

// PAYPAL ENDPOINTS

// BRAINTREE ENDPOINTS

// PIX ENDPOINTS


module.exports = router;

async function getPatreonPayload(req) {
    const patreonData = await axios.request({
        method: "GET",
        url: `${PATREON_URL}/api/oauth2/v2/campaigns/${CAMPAIGN_ID}/members` +
            encodeURI(
                `?include=user,currently_entitled_tiers` +
                `&fields[member]=patron_status,email,campaign_lifetime_support_cents,currently_entitled_amount_cents,full_name,patron_status` +
                `&fields[user]=social_connections` +
                `&fields[tier]=amount_cents,discord_role_ids,title` +
                `&page[size]=1000`

            ),
        headers: {
            Authorization: `Bearer ${PATREON_TOKEN}`
        }
    });

    const status = patreonData.status;
    const { data, included } = patreonData.data;
    const dataFilter = data.filter(m => m.attributes?.patron_status !== "former_patron");
    let parsed = data.map(member => {
        const newMember = member.attributes;
        const memberID = member.relationships?.user?.data?.id;
        const memberTier = member.relationships?.currently_entitled_tiers?.data?.[0]?.id;

        newMember.patreon_id = memberID;

        const tierData = included.find(tier => tier.id == memberTier);
        const userData = included.find(usr => usr.id == memberID && usr.type === 'user');
        newMember.discord = userData?.attributes?.social_connections?.discord?.user_id;
        newMember.tier = tierData?.attributes?.title;
        newMember.discord_roles = tierData?.attributes?.discord_role_ids;

        return newMember;
    });

    parsed = parsed.sort(({ campaign_lifetime_support_cents: a }, { campaign_lifetime_support_cents: b }) => { return b - a; });

    return parsed;
}
