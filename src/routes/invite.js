const config = require("../../config.js");

const axios = require("axios");

const express = require('express');
const router = express.Router();

const inviteString = (selected_client,server) => 
    `https://discord.com/api/oauth2/authorize`+
    `?client_id=${ selected_client }&permissions=2416240704`+
    `&redirect_uri=${ HOST+"/invite/verify/" + selected_client }`+      
    `&response_type=code`+
    `&scope=${["applications.commands","bot","identify","guilds","connections","email"].join("%20")}`+
    `&permissions=268492816`+
    `&disable_guild_select=${ !!server }`+
    `&guild_id=${ server }`;


router.get("/verify/:flavor", async  (req, res) => {
  const { flavor } = req.params;
  const { guild_id } = req.query;
  const selected_client = config.clients.find((c) => c.id === flavor);

  if (selected_client.category === "premium"){
    const UID = req.user?.id;
    if (!UID) return res.status(403).redirect("/auth");
    const userData = await DB.users.findOne({id:UID}).noCache().lean();
    const serverAlreadyRegistered = await DB.servers.findOne({id:guild_id}).noCache().lean();

    if (serverAlreadyRegistered){
      if (serverAlreadyRegistered.activeClients?.filter(x=>x!==PLX.id)?.length){
        console.log(serverAlreadyRegistered.activeClients,'what bruh')
        return res.status(403).send("THERE'S ALREADY ONE PRIME CLIENT IN THIS SERVER");
      };
    }
    
    if (!userData.prime?.servers?.includes(guild_id)){
      return res.status(403).send("PRIME NOT ENABLED FOR THIS SERVER");
    }
  }


  const options = {
    method: "POST",
    url: "https://discord.com/api/v9/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: new URLSearchParams({
      client_id: selected_client.id,
      client_secret: selected_client.secret,
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: HOST + "/invite/verify/" + selected_client.id,
    }),
  };

  axios
    .request(options)
    .then(function (response) {
      return res.redirect("/setup/"+guild_id)
    })
    .catch(async function (error) {
      console.log(error.response.data);
      return res.status(500).json({ r: error.response.data });
    });
});

router.get('/:flavor', function (req, res) {
  const {flavor} = req.params;
  const {sv:server} = req.query;

  const flavored_client = config.clients.find(c=> c.name === flavor) || config.clients.find(c=> c.id === PLX.id);
  
  console.log({flavored_client})

  res.redirect( inviteString(flavored_client.id, server) );
})
router.get('/', function (req, res) {
  const {sv:server} = req.query;  
  const flavored_client = config.clients.find(c=> c.id === PLX.id);  
  res.redirect( inviteString(flavored_client.id, server) );
})

router.get("/activate/:flavor/:serverID", checkAuth, async (req, res) => {

  const { flavor, serverID } = req.params;

  const flavored_client = config.clients.find(c=> c.name === flavor);

  const serverData = await DB.servers.findOne({id:serverID}).noCache().lean();
  const userData = await DB.users.findOne({id:req.user.id}).noCache().lean();

  if (!userData) return res.status(401).json({message:"User not found"});
  if (!serverData) return res.status(404).json({message:"Server not found"});
  if (!userData.prime || !userData.prime.active)  return res.status(403).json({message:"User not Prime or Prime not active."});
  if (userData.prime.servers?.length >= userData.prime?.maxServers)  return res.status(403).json({message:"Max Prime servers reached."});

    
  const prePrime = await DB.users.findOne({"prime.servers":serverID});
  if (prePrime && prePrime.id !== req.user.id) return res.status(409).json({
    message:"Server already activated by someone else",
    data: {
      name: prePrime.name,
      id: prePrime.id
    }
  });

  //if (prePrime)  return res.status(409).json({message:"Server already activated by you! Deactivate it first if you want to switch clients"});

  if (polluxClients?.has(flavored_client.id)){
    Array.from(polluxClients, ([,{client,user}]) => {
      if (client.category === "premium" && serverID !== config.official_guild){
        client.leaveGuild(serverID).catch(er=>{})
      }
    })
    
  }

  DB.users.set(req.user.id, {$addToSet:{ "prime.servers": serverID }}).then(r=>{
    res.redirect(`/invite/${flavor}?sv=${serverID}`);
  }).catch(err=>{
    return res.status(500).json({message:"Internal server error."});
  });

})

module.exports = router