const ECO = require('../pipelines/economy.js')
const express = require('express');
const router = express.Router();
const fx = require('../pipelines/globalFunctions.js');

global.serversWithPollux = global.serversWithPollux ? serversWithPollux : new Map();
const serverHasPollux = async (id) => {
    
    let hasP = serversWithPollux.get(id);
    let hasPCheck = PLX.getRESTGuild(id)
        .catch(()=>{
            serversWithPollux.set(id,{res:false});
            return false;
        })
        .then(r=>{
            if (!r) return false;
            serversWithPollux.set(id,{res:true});
            return true;
        })
    
    if (hasP) res = hasP.res;
    else res = await hasPCheck;
    return res === true;
}


router.get('/bsave', checkAuth, async (req,res)=>{

    const bcol = await DB.usercols.get(req.user.id);
    
    res.render('private/boorusave',{boorucollection: bcol?bcol.collections.boorusave:[]})
})

router.get('/imgbookmarks/:id', async (req,res)=>{
 
    const [gallery,user] = await Promise.all([
        DB.usercols.get(req.params.id),
        DB.users.get(req.params.id,{switches:1})
    ]);
    if (user.switches?.booruPublic === false){
        res.json( {loading: true, status: "PRIVATE"} );
    }else{
        res.json( gallery?.collections.boorusave||[])
    }
})

router.post('/imgbookmarks/expand', async (req,res)=>{
    try{
        if(!req.user) return res.sendStatus(401);
        let userdata = await DB.users.get(req.user.id);
        if(userdata.modules.SPH < 3) return res.status(403).send('Insufficient Funds');
        if(!userdata.switches || userdata.switches.booruSlots === undefined ){
            await DB.users.set(req.user.id,{$set: {"switches.booruSlots":25} });
        }        
        await ECO.pay(req.user.id,3,'expand_gallery_slots','SPH');
        return DB.users.set(req.user.id,{$inc: {"switches.booruSlots":10} })
            .then(x=> res.sendStatus(200) )
            .catch(x=> res.sendStatus(504) );
    }catch(e){
        res.sendStatus(503)
    }
})

router.post('/imgbookmarks/shrink', async (req,res)=>{
    try{
        if(!req.user) return res.sendStatus(401);
        let userdata = await DB.users.get(req.user.id);        
        if(!userdata.switches || userdata.switches.booruSlots === undefined ){
             userdata = await DB.users.findOneAndUpdate({id:req.user.id},{$set: {"switches.booruSlots":25} }).lean().exec();
        }        
        if (userdata.switches.booruSlots+userdata.modules.level <= 3) return res.status(403).send("No more slots!");
        let reduce = (userdata.switches.booruSlots+userdata.modules.level) < 10 ? (userdata.switches.booruSlots+userdata.modules.level) : 10; 

        await ECO.receive(req.user.id,2,'sell_gallery_slots','SPH');
        return DB.users.set(req.user.id,{$inc: {"switches.booruSlots":-reduce} })
            .then(x=> res.sendStatus(200) )
            .catch(x=> res.sendStatus(504) );
    }catch(e){
        res.sendStatus(503)
    }
})

router.patch('/imgbookmarks/makepublic', async (req,res)=>{
    try{
        if(!req.user) return res.sendStatus(401);
        let state = req.body.set  
        return DB.users.set(req.user.id,{$set: {"switches.booruPublic": state} })
            .then(x=> res.sendStatus(200) )
            .catch(x=> res.sendStatus(504) );
    }catch(e){
        res.sendStatus(503)
    }
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

router.get(["/","/:endpoint"], checkAuth, async (req,res)=>{
 
    const [ALLCOSM,ALLITEMS,BCOL,SERVEROWNERSHIP] = await Promise.all([
         DB.cosmetics.find({}).lean().exec(),
         DB.items.find({}).lean().exec(),
         DB.usercols.get(req.user.id),
         Promise.all(req.user.guilds.map(async g=>{
            g.rank= g.owner ? "Owner" : (g.permissions & 0x8) > 0 ? "Admin" : (g.permissions & 0x20) > 0 ? "Manager" : /*(await isAdmin(req,g.id)) ? "Moderator" :*/ 'Commoner';
            g.hasPollux = !!(await serverHasPollux(g.id));
            g.rankSort = g.rank == "Owner" ? 0 : g.rank == "Admin" ? 1 : g.rank == "Manager" ? 2 : "Moderator" ? 3 : 4;
            return g;
        }))
    ]);



    const MDINFO = ALLCOSM.filter(x=>x.type== "medal"      )

    const DCKINFO= ALLCOSM.filter(x=>x.type== "skin")

    if(res.locals?.userinfo){

        res.locals.userinfo.servers = SERVEROWNERSHIP; 
    }

    res.render('dashboard/main',{ALLITEMS,MDINFO,DCKINFO,
        boorucollection: BCOL?.collections?.boorusave || [],
        endpoint: req.params.endpoint 
    })

})
 
//PROFILE

router.patch("/misc/:endpoint", async (req,res)=>{
    
    const UID = req.user.id;
    const _endpt = req.params.endpoint;
    const payload = req.body
    const USERDATA = await DB.users.get(UID);


    
    if (_endpt == "skin"){
        if (payload.skinId!='default' && !USERDATA.modules.skinInventory.includes(payload.skinFor+"_"+payload.skinId)) return res.status(403).json("INVALID SKIN");
        return DB.users.set(UID, {$set: {["modules.skins."+payload.skinFor] : payload.skinId } } ).then(()=> res.sendStatus(200) ).catch(e=> res.status(500).send(e) );
    }
    
    if (_endpt == "attr"){
        return DB.users.set(UID, {$set: {"switches.variables" : payload.attrSet } } ).then((re)=> res.status(200).send( Object.assign({UID},re)) ).catch(e=> res.status(500).send(e) );
    }

    if (_endpt == "notifs"){
        console.log({payload},typeof payload)
        return DB.users.set(UID, {$set: {"switches.notifications" : payload } } ).then((x)=>  res.sendStatus(200)  ).catch(e=> res.status(500).send(e) );
    }
   

})


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


    if (global.Progression){
        Progression.emit("action.profile.edit",{userID: UID, value: 1});
        console.log("Global Progression Emit: Edit Profile")
    }else{
        console.log("noprog")
    }
    
    //traditional
    if (_endpt == "background-legacy"){
        if (!USERDATA.modules.bgInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.bgID" : payload} } ).then(()=> res.sendStatus(200) );
    }
    //positional
    if (_endpt == "background"){
        if (payload === -2 && USERDATA.donator){
            return DB.users.set(UID, {$set: {"modules.bgID" : UID} } ).then(()=> res.status(200).send("Saved! "+payload) );    
        }
        if (!Number(payload+1) || USERDATA.modules.bgInventory.length <= Number(payload) ) return invalidPayload("Index out of Range");
        return DB.users.set(UID, {$set: {"modules.bgID" : USERDATA.modules.bgInventory[payload]} } ).then(()=> res.status(200).send("Saved! "+payload) );
    }

    if (_endpt == "flair"){
        if (payload!="default" && !USERDATA.modules.flairsInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.flairTop" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "medal"){
        let [medal,index] = payload.split(',');
        if (medal!="0" && !USERDATA.modules.medalInventory.includes(medal)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {[`modules.medal.${index}`] : medal} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "sticker"){
        if (payload && !USERDATA.modules.stickerInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"modules.sticker" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "color"){
        return DB.users.set(UID, {$set: {"modules.favcolor" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "wife"){
        return DB.users.set(UID, {$set: {"featuredMarriage" : payload} } ).then(()=> res.sendStatus(200) );
    }



})


router.put('/profile/medals', async (req,res)=>{
    console.log(req.body,typeof req.body,"MEDALS BODY");
    try{
        

        const UID = req.user.id;
        const USERDATA = await DB.users.get(UID);
        
        let payload = req.body.map((v,i,a) => a.indexOf(v) == i ?v:v=="0"?0:0);
        payload = payload.map((medal,i,pld) => (
            USERDATA.modules.medalInventory.includes(medal)||
            USERDATA.modules.achievements.includes(medal)) ||
            pld.indexOf(medal) === i 
            ? medal : 0 );
            console.log(payload)
            return DB.users.set(UID, {$set: {"modules.medals" : payload} } ).then(()=> res.sendStatus(200) );
    }catch(e){
        console.error(e)
        res.status(500).json(e.message)
    }

})

router.put('/servers/faves', async (req,res)=>{
    try{
        const UID = req.user.id;
        const SV = req.query.sv
        const switcher = req.query.switch == 1
        if(switcher){
            return DB.users.set(UID, {$addToSet: {"switches.favServers" : SV} } ).then(()=> res.sendStatus(200) );
        }else{
            return DB.users.set(UID, {$pull: {"switches.favServers" : SV} } ).then(()=> res.sendStatus(200) );
        }
    }catch(e){
        console.error(e)
        res.status(500).json(e.message)
    }
})
 

module.exports = router