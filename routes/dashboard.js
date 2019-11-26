const DB = require('../database');
const express = require('express');
const router = express.Router();
const fx = require('../pipelines/globalFunctions.js');





router.get('/bsave', checkAuth, async (req,res)=>{
    console.log('test')
    const bcol = await DB.usercols.get(req.user.id);
    
    res.render('private/boorusave',{boorucollection: bcol?bcol.collections.boorusave:[]})
})

router.delete('/imgbookmarks/:id', async (req,res)=>{
    try{

        if(!req.user) return res.sendStatus(401);
        let userdata = await DB.usercols.get(req.user.id);
    let item = userdata.collections.boorusave.find(x=> x.saved == req.params.id );
    if (!item) return res.sendStatus(404);
    let newcol = userdata.collections.boorusave.filter(i=>i.saved != item.saved);
    if(newcol == {}) return res.sendStatus(504) ;
    return DB.usercols.set(req.user.id,{$set: {"collections.boorusave":newcol} })
    .then(x=> res.sendStatus(200) )
    .catch(x=> res.sendStatus(504) );
    }catch(e){
        res.sendStatus(503)
    }
  

})

/*
router.use("/profile",(req,res,nex)=> { 
    if( !req.user ) return res.status(401).send("User not Authenticated");
    else nex()
});
*/

router.get("/profile", async (req,res)=>{
console.log('test2')
    res.render('dashboard/profile_edit')

})
 
//PROFILE

router.patch("/profile/:endpoint", async (req,res)=>{
    
    const UID = req.user.id;
    const _endpt = req.params.endpoint;
    const payload = req.body.data

    if (_endpt == "tagline")     return DB.users.set(UID, {$set: {"modules.tagline" : payload} } ).then(()=> res.sendStatus(200) );
    if (_endpt == "personaltxt") return DB.users.set(UID, {$set: {"modules.persotext" : payload} } ).then(()=> res.sendStatus(200) );
    if (_endpt == "frame")       return DB.users.set(UID, {$set: {"switches.profileFrame" : payload} } ).then(()=> res.sendStatus(200) );



    console.log(UID)
    const USERDATA = await DB.users.get(UID);
    if(!USERDATA.modules) return res.status(400).send("Incomplete UserData");


    const invalidPayload = (pld) => res.status(403).send("INVALID PAYLOAD: "+payload)

    //traditional
    if (_endpt == "background-legacy"){
        if (!USERDATA.modules.bgInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.bgID" : payload} } ).then(()=> res.sendStatus(200) );
    }
    //positional
    if (_endpt == "background"){
        if (!Number(payload) || USERDATA.modules.bgInventory.length <= Number(payload) ) return invalidPayload("Index out of Range");
        return DB.users.set(UID, {$set: {"modules.bgID" : USERDATA.modules.bgInventory[payload]} } ).then(()=> res.status(200).send("Saved! "+payload) );
    }

    if (_endpt == "flair"){
        if (payload!="default" && !USERDATA.modules.bgInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.flairTop" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "medal"){
        let [medal,index] = payload.split(',');
        if (medal!="0" && !USERDATA.modules.medalInventory.includes(medal)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {[`modules.flairTop.${index}`] : medal} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "sticker"){
        if (payload && !USERDATA.modules.stickerInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.sticker" : payload} } ).then(()=> res.sendStatus(200) );
    }

})
router.put('/profile/medals', async (req,res)=>{    
    console.log(req.body,typeof req.body);
    
    const UID = req.user.id;
    const USERDATA = await DB.users.get(UID);

    const payload = req.body.map((v,i,a) => a.indexOf(v) == i ?v:v=="0"?0:0);
    payload = payload.map(medal => (
        USERDATA.modules.medalInventory.includes(medal)||
        USERDATA.modules.achievements.includes(medal)) 
        ? medal : 0 );

    return DB.users.set(UID, {$set: {"modules.medals" : payload} } ).then(()=> res.sendStatus(200) );

})


 

module.exports = router