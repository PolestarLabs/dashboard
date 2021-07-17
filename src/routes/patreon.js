const express = require("express");
const router = express.Router();
const jpath = require('jsonpath');
const axios = require('axios')
const config = require("../../config.js");
const redirect_uri=`${HOST}/patreon/redir`

router.get("/auth", checkAuth, async (req, res, next) => {

    const client_id= config.patreon.client_id;
    
    scope="identity.memberships pledges-to-me my-campaign users my-campaign"

  res.redirect(
      `https://www.patreon.com/oauth2/authorize`+
      `?response_type=code`+
      `&client_id=${client_id}`+
      `&redirect_uri=${redirect_uri}`+
     
      `&state=${req.user.id}${req.query.state?`:${req.query.state}`:""}`
  );
});

router.get("/redir", checkAuth, async (req, res) => {

    const {code,state} = req.query;
    const [userID,queryInfo] = state?.split(":")||[];

    console.log({queryInfo});

    if (req.user?.id != userID) return res.status(401).json("No user or user mismatch");

    const dashsets = `${HOST}/dash/settings`;
    
    axios.post(
        `https://www.patreon.com/api/oauth2/token`+
            `?code=${code}`+
            `&grant_type=${"authorization_code"}`+
            `&client_id=${config.patreon.client_id}`+
            `&client_secret=${config.patreon.client_secret}`+
            `&redirect_uri=${redirect_uri}`,
        {
            headers:{
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        
    ).then(async response=>{
        const {data} = response;
        
        const identity_payload = await handlePatreonUserData(data.access_token);
        if (identity_payload.status != 200) return res.status(identity_payload.status).json(identity_payload);

        data.identity = identity_payload.data;
        await DB.users.set(req.user.id,{'switches.patreon':data});

        if (queryInfo == "popup"){
            return res.render("callback",{target:dashsets});
        }else{
            return res.redirect(dashsets);
        }

    }).catch(err=>{    
        return res.status(500).json( "ERROR");
    })


});


router.get("/identify", async (req, res) => {

    let {uid,access} = req.query;

    const userData = DB.users.get(uid||req.user.id);
    if (!userData) return res.status(404).json("No user");
    
    const {patreon} = userData?.switches||{};
    if (!patreon && !access) return res.status(404).json("No Patreon Identifier");
    
    const {access_token,expires_in,refresh_token} = patreon || {access_token:access, expires_in: 120};

    if ( Date.now() > (expires_in*1000)+Date.now() ) return res.status(401).json("Token expired");
    let parsed = await handlePatreonUserData(access_token);
    if (parsed.status != 200) return res.status(parsed.status).json(parsed);
    else return res.json(parsed.data);


})




module.exports = router;



async function handlePatreonUserData(access_token){    
    const user_identity_payload= await axios.get(
        `https://patreon.com/api/oauth2/v2/identity`+
            `?include=memberships.currently_entitled_tiers`+
            `&${ encodeURIComponent("fields[tier]") }=amount_cents,description,discord_role_ids,title`+
            `&${ encodeURIComponent("fields[user]") }=full_name,social_connections,thumb_url,url`,

            {headers:{"Authorization": `Bearer ${access_token}`}}

    ).catch(async err=>{
        return null;
    });

    if (!user_identity_payload) return {status:500,message:"Patreon Fetch Error"};
    const {data} = user_identity_payload;
    
    const attributes = jpath.value(data,"data.attributes");
    if (!attributes)  return  {status:406,message:"No attributes granted"};

    const {full_name,thumb_url,url,social_connections} = jpath.value(data,"data.attributes");
    const discord_user_id = social_connections?.discord?.user_id || null;

    const tier = jpath.value(data,"included[?(@.type.match('tier'))].attributes.title");
    const discord_role_ids = jpath.value(data,"included[?(@.type.match('tier'))].attributes.discord_role_ids");

    return {
       status: 200,
       data: {
        full_name,
        thumb_url,
        url,
        discord_user_id,
        discord_role_ids,
        tier,
       }
    };

}