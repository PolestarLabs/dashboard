const config = require("../../config.js");

const axios = require("axios");

const express = require('express');
const router = express.Router();

const inviteString = (selected_client,server) => 
    `https://discord.com/api/oauth2/authorize`+
    `?client_id=${ selected_client }&permissions=2147532800`+
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
  
module.exports = router