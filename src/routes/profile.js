// const DB = require('../database')
const express = require('express')
const router = express.Router() 


router.get('/', (req, res)=> {
    res.redirect('/me')
})




router.get('/:endpoint', async (req, res)=> {
    
    let userprofile = {}
    if(req.params.endpoint === 'me'){
        if(!req.user) return res.redirect('/auth');
        userprofile = res.locals.userdata;

    }else{
        userprofile =  await DB.users.findOne({$or:[{id: req.params.endpoint},{personalhandle: req.params.endpoint}]}).noCache();
    }

    if(!userprofile) return res.send(404);
 
 
    const userDiscord = (await userCache.get( userprofile.id )) || (await PLX.getRESTUser( userprofile.id ));

    const userInventory = await DB.userInventory.get( userprofile.id );
    userprofile.inventory = {
        items:            userInventory?.inventory         ?? [],
        bgInventory:      userInventory?.bgInventory       ?? [],
        medalInventory:   userInventory?.medalInventory    ?? [],
        stickerInventory: userInventory?.stickerInventory  ?? [],
        skinInventory:    userInventory?.skinInventory     ?? [],
        flairInventory:   userInventory?.flairInventory    ?? [],
        stickerShowcase:  userInventory?.stickerShowcase   ?? [],
        achievements:     userInventory?.achievements      ?? [],
        fishes:           userInventory?.fishes            ?? [],
    };

    let donoranks;
    if(userprofile.prime?.tier){
        let donators = await DB.users.find( {'switches.donateStreak.total' :{$gte: 1}},{profile:0,personal:0,eventData:0} ).lean();
        function donatorScore(dono){
            let tally =0;
            tally+= 2 * dono.switches?.donateStreak.plastic      || 0
            tally+= 5 * dono.switches?.donateStreak.aluminium    || 0
            tally+= 10 * dono.switches?.donateStreak.iron        || 0
            tally+= 10 * dono.switches?.donateStreak.carbon      || 0
            tally+= 15 * dono.switches?.donateStreak.iridium     || 0
            tally+= 15 * dono.switches?.donateStreak.lithium     || 0
            tally+= 25 * dono.switches?.donateStreak.palladium   || 0
            tally+= 50 * dono.switches?.donateStreak.zircon      || 0
            tally+= 75 * dono.switches?.donateStreak.uranium     || 0
            tally+= 100 * dono.switches?.donateStreak.astatine   || 0
            tally+= 500 * dono.switches?.donateStreak.antimatter || 0
            tally+= 1000 * dono.switches?.donateStreak.neutrino  || 0

            return tally;
        }
        donoranks = donators.map(don=> {let = xdon = JSON.parse(JSON.stringify(don)); xdon.donoScore = donatorScore(xdon); return xdon;} )
        donoranks = donoranks.sort((a,b)=> b.donoScore - a.donoScore)
    }
    
    
    userprofile.meta.avatar = `https://cdn.discordapp.com/avatars/${userprofile.id}/${userDiscord.avatar}.png`;
    userprofile.meta.username = userDiscord.username

    const opengraph = {
        image: `${HOST}/generators/pfpv.png?u=${userprofile.id}`,
        large: true,
        title: `${userDiscord.username}`,
        color: userprofile.profile?.favcolor,
        description: `${userprofile.profile?.persotext}`,
      }
    const oembedObj = {
        version: "1.0"
        ,type: "rich"
        //,provider_name: `📬 ${entry.userdata?.meta?.tag}`
        //,provider_url: HOST + "/shop/marketplace"
        ,author_name: userprofile.profile?.tagline
       //,author_url: `${HOST}/p/${userDiscord.id}`
        ,thumbnail_url: `${HOST}/p/${userDiscord.id}`
        ,url: `${HOST}/p/${userDiscord.id}`
        ,thumbnail_height: 300
        ,thumbnail_width: 700        
        
      }
      const oembed = encodeURIComponent(JSON.stringify(oembedObj));


    res.render('public/profile',{userprofile,donoranks, opengraph, oembed})

})


 
 

 
module.exports = router  

