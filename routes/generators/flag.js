const request = require('request')



const express = require('express');
const router = express.Router();

router.get('/me.png', async (req,res)=>{
    console.log(req)
    let country = req.headers['cf-ipcountry'];
    return res.redirect("https://www.countryflags.io/"+country+"/flat/64.png");
})

module.exports = router