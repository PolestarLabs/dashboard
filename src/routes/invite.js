const config = require("../../config.js");

const axios = require("axios");

const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.redirect(
      `https://discord.com/api/oauth2/authorize`+
        `?client_id=${ PLX.id }&permissions=2147532800`+
        //`&redirect_uri=${ encodeURIComponent(HOST+"/invite/newserver") }`+
        `&redirect_uri=${ "https://hijola.pollux.gg/invite/newserver" }`+
        `&response_type=code`+
        `&scope=${["applications.commands","bot","identify","guilds","connections","email"].join("%20")}`+
        `&permissions=268492816`+
        `&disable_guild_select=${ !!req.query.sv }`+
        `&guild_id=${ req.query.sv }`)
  });

  router.get('/newserver', (req,res) => {

    const options = {
    method: 'POST',
    url: 'https://discord.com/api/v9/oauth2/token',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
            client_id: '354285599588483082',
            client_secret: 'YHOQUdac8RmWplf9jS6jYLYzj73206RH',
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: 'https://hijola.pollux.gg/invite/newserver'
        })
    };

    axios.request(options).then(function (response) {
        return res.status(200).json({q:req.query,data:response.data});
    }).catch( async function (error) {
        console.log(error.response.data);
        return res.status(500).json({r: error.response.data  });
        
    });
        
    
  });
  
module.exports = router