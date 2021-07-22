const express = require("express");
const router = express.Router();
const {apikey,secret} = require("../../config.js").lastfm;
const crypto = require('crypto')
const axios = require('axios')

router.get("/auth", async (req, res, next) => {
  res.redirect(
    "https://www.last.fm/api/auth?api_key="+apikey
  );
});

router.get("/callback", async (req, res) => {
    
    const {token} = req.query;
    const method = "auth.getSession"
    
    const SIG = crypto.createHash("md5").update(`api_key${apikey}method${method}token${token}${secret}`).digest("hex");
    const uri = `http://ws.audioscrobbler.com/2.0?token=${token}&api_key=${apikey}&api_sig=${SIG}&method=auth.getSession&format=json`;
    axios.get(uri).then(async response=>{
        const restoken = response.data?.session;
        if (!restoken) return res.status(500).json({data:response.data});
        await DB.users.set(req.user.id,{'connections.lastfm':restoken});
        return res.status(200).render("callback",{timer:5});
    }).catch(err=>{
         return res.status(500).json({ SIG, token});
    })


});
router.get("/scrobble", async (req, res) => {

    let {artist,timestamp,sk,track,user_id} = req.query;
    const method = "track.scrobble";

    user_id ??= req.user.id
    artist ??= "T-Square";
    timestamp ??= 1626321003;~~(Date.now()/1000);
    track ??= "TRUTH";
    
    
    const userData = await  DB.users.get(user_id);
    
    
    sk ??= userData.switches?.lastfm?.key;
    
    
    let subj = `api_key${apikey}artist${artist}method${method}sk${sk}timestamp${timestamp}track${track}${secret}`;
    if (!sk) return res.status(500).json("NO SK");

    console.table({user_id,sk:userData.switches?.lastfm,subj})
    const SIG = crypto.createHash("md5").update(subj).digest("hex");



    axios.post(`https://ws.audioscrobbler.com/2.0/?`
        +`api_key=${apikey}&artist=${artist}&method=${method}&sk=${sk}&timestamp=${timestamp}&track=${track}&api_sig=${SIG}&format=json`)
    .then(async response=>{
        
        return res.status(200).json( response.data );
    }).catch(err=>{
        //return res.redirect("/lastfm/auth");
        
        return res.status(500).json( err.response.data );

    })
     
})


module.exports = router;
