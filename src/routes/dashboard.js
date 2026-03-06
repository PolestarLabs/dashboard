const Eris = require('eris')
const ECO = require('../pipelines/economy.js')
const express = require('express');
const router = express.Router();
const fx = require('../pipelines/globalFunctions.js');
const config = require('../../config.js');

const serversWithPollux = global.serversWithPollux ? serversWithPollux : new Map();
const serverHasPollux = async (id, activePLXId) => {

    const svData = await DB.servers.get(id,{id:1,activeClients:1});
    if (!svData) return false;
    if (!svData.activeClients?.length) return false;
    // On staging, only count the server as "has Pollux" if the active session client is one of its clients
    if (activePLXId && svData.activeClients && !svData.activeClients.includes(activePLXId)) return false;
    return svData.activeClients;

    /*
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
    */
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
        if(userdata.currency.SPH < 3) return res.status(403).send('Insufficient Funds');
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
        if (userdata.switches.booruSlots+userdata.progression.level <= 3) return res.status(403).send("No more slots!");
        let reduce = (userdata.switches.booruSlots+userdata.progression.level) < 10 ? (userdata.switches.booruSlots+userdata.progression.level) : 10; 

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

const LOAD_ALL_SUBCLIENTS = Promise.all(
    config.clients.map(async cli=>{
        const newClient = new Eris.Client(cli.token,{restMode:true});
        newClient.id = cli.id;
        newClient.category = cli.category;
        newClient.friendly_name = cli.fname;
        newClient.internal_name = cli.name;
        const restUser =  await newClient.getRESTUser(cli.id).catch(e=>PLX.user);
        console.log({restUser,newClient})
        const user = JSON.parse(JSON.stringify( restUser || {} ));
        user.fname = cli.fname;
        user.flavor = cli.name;
        user.category = cli.category;        
        polluxClients.set(cli.id,{client:newClient,user});

        return user;
    })
);
router.get(["/","/:endpoint"], checkAuth, async (req,res)=>{
    
    const activePLX = req.PLX || PLX;
    const stagingClientId = (process.env.STAGING || process.env.NODE_ENV !== 'production') ? activePLX.id : null;
    const [MANSION_SERVER_DATA,MANSION_MEMBER] = await Promise.all([
         activePLX.getRESTGuild(config.official_guild).catch(err=>null),
         activePLX.resolveMember(config.official_guild,req.user.id).catch(err=>null)
    ]);

    const [ALLCOSM,ALLITEMS,BCOL,SERVEROWNERSHIP] = await Promise.all([
         DB.cosmetics.find({}).lean().exec(),
         DB.items.find({}).lean().exec(),
         DB.usercols.get(req.user.id),
         Promise.all(req.user.guilds.map(async g=>{
            g.rank= g.owner ? "Owner" : (g.permissions & 0x8) > 0 ? "Admin" : (g.permissions & 0x20) > 0 ? "Manager" : /*(await isAdmin(req,g.id)) ? "Moderator" :*/ 'Commoner';
            const hasPollux = await serverHasPollux(g.id, stagingClientId);
            g.hasPollux = !!(hasPollux);
            g.hasPolluxDetail = hasPollux;
            g.rankSort = g.rank == "Owner" ? 0 : g.rank == "Admin" ? 1 : g.rank == "Manager" ? 2 : "Moderator" ? 3 : 4;
            return g;
        })),
        LOAD_ALL_SUBCLIENTS
    ]);

    const MDINFO = ALLCOSM.filter(x=>x.type== "medal"      )

    const DCKINFO= ALLCOSM.filter(x=>x.type== "skin")

    if(res.locals?.userinfo){
        res.locals.userinfo.servers = SERVEROWNERSHIP; 
    }

    res.render('dashboard/main',{ALLITEMS,MDINFO,DCKINFO,
        boorucollection: BCOL?.collections?.boorusave || [],
        endpoint: req.params.endpoint,
        MANSION_SERVER_DATA,MANSION_MEMBER,
        POLLUX_USERS: Array.from(polluxClients, ([,{client,user}]) => {
            client.user = user;
            return client;
        })
    })

})
 
//PROFILE

router.patch("/misc/:endpoint", async (req,res)=>{
    
    const UID = req.user.id;
    const _endpt = req.params.endpoint;
    const payload = req.body
    const USERDATA = await DB.users.get(UID);


    
    if (_endpt == "skin"){
        if (payload.skinId!='default' && !USERDATA.profile.skinInventory.includes(payload.skinFor+"_"+payload.skinId)) return res.status(403).json("INVALID SKIN");
        return DB.users.set(UID, {$set: {["profile.skins."+payload.skinFor] : payload.skinId } } ).then(()=> res.sendStatus(200) ).catch(e=> res.status(500).send(e) );
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

    if (_endpt == "tagline")     return DB.users.set(UID, {$set: {"profile.tagline" : payload} } ).then(()=> res.sendStatus(200) );
    if (_endpt == "personaltxt") return DB.users.set(UID, {$set: {"profile.persotext" : payload} } ).then(()=> res.sendStatus(200) );
    if (_endpt == "frame")       return DB.users.set(UID, {$set: {"switches.profileFrame" : payload} } ).then(()=> res.sendStatus(200) );



    console.log(UID)
    const USERDATA = await DB.users.get(UID);
    if(!USERDATA.profile) return res.status(400).send("Incomplete UserData");


    const invalidPayload = (pld) => res.status(403).send("INVALID PAYLOAD: "+payload)


    if (global.Progression){
        Progression.emit("action.profile.edit",{userID: UID, value: 1});
        console.log("Global Progression Emit: Edit Profile")
    }
    
    //traditional
    if (_endpt == "background-legacy"){
        if (!USERDATA.profile.bgInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"profile.bgID" : payload} } ).then(()=> res.sendStatus(200) );
    }
    //positional
    if (_endpt == "background"){
        if (payload === -2 && USERDATA.prime?.tier){
            return DB.users.set(UID, {$set: {"profile.bgID" : UID} } ).then(()=> res.status(200).send("Saved! "+payload) );
        }
        if (!Number(payload+1) || USERDATA.profile.bgInventory.length <= Number(payload) ) return invalidPayload("Index out of Range");
        return DB.users.set(UID, {$set: {"profile.bgID" : USERDATA.profile.bgInventory[payload]} } ).then(()=> res.status(200).send("Saved! "+payload) );
    }

    if (_endpt == "flair"){
        if (payload!="default" && !USERDATA.profile.flairsInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"profile.flairTop" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "medal"){
        let [medal,index] = payload.split(',');
        if (medal!="0" && !USERDATA.profile.medalInventory.includes(medal)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {[`profile.medals.${index}`] : medal} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "sticker"){
        if (payload && !USERDATA.profile.stickerInventory.includes(payload)) return invalidPayload(payload);
        return DB.users.set(UID, {$set: {"profile.sticker" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "color"){
        return DB.users.set(UID, {$set: {"profile.favcolor" : payload} } ).then(()=> res.sendStatus(200) );
    }

    if (_endpt == "wife"){
        return DB.users.set(UID, {$set: {"profile.featuredMarriage" : payload} } ).then(()=> res.sendStatus(200) );
    }



})


router.put('/profile/medals', async (req,res)=>{
    console.log(req.body,typeof req.body,"MEDALS BODY");
    try{
        

        const UID = req.user.id;
        const USERDATA = await DB.users.get(UID);
        
        let payload = req.body.map((v,i,a) => a.indexOf(v) == i ?v:v=="0"?0:0);
        payload = payload.map((medal,i,pld) => (
            USERDATA.profile.medalInventory.includes(medal)||
            USERDATA.profile.achievements.includes(medal)) ||
            pld.indexOf(medal) === i
            ? medal : 0 );
            console.log(payload)
            return DB.users.set(UID, {$set: {"profile.medals" : payload} } ).then(()=> res.sendStatus(200) );
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
