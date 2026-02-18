const express = require('express');
const router = express.Router();


router.get('/', async (req,res)=>{
    
})

const TOP100CACHE = new Map();
router.get('/top100', async (req,res)=>{
    const serverID = res.locals.serverID;
    console.log('top100',{serverID})

    const top100wait = DB.localranks.find({server:serverID},{_id:0,__v:0}).sort({exp:-1}).limit(100).lean().then(x=>TOP100CACHE.set(serverID,x) && x);
    await Promise.race([top100wait,wait(1)]);
    let top100 = TOP100CACHE.get(serverID);
    if (!top100?.length) top100 = await top100wait;

    const discordUsers = await Promise.all(top100.map(async RNK=>{
        let discordUser =   await userCache.get( RNK.user ).catch(err=>null);
        if (!discordUser) return null;
        userCache.set(discordUser.id,discordUser);
        let {id,avatar,bot,username} = discordUser;
        const response =  {id,avatar,bot,username};
        response.polluxData = RNK ? {
            exp: RNK.exp, 
            level: RNK.level 
        } : null;
       
        return response;
    })).catch(err=> console.log(err) && res.status(500).json("ERROR") );

    return res.json(discordUsers||[]);    

})

router.get('/search', async (req,res)=>{
    const serverID = res.locals.serverID;
    const query = req.query.q;
    const results = await PLX.searchGuildMembers(serverID, query, 20).catch((err) => []);
    const dbResults = await DB.localranks.find({server:serverID, user: {$in:results.map(r=>r.id)}},{_id:0,__v:0}).lean();
    
    const final = results.map(r=> {
        const newDoc = {};
        const polluxData = dbResults.find(d=>d.user===r.id) || {exp:0,level:0};
        newDoc.polluxData = polluxData ? {
            exp: polluxData.exp, 
            level: polluxData.level 
        } : null;
        Object.assign(newDoc,r);
        return newDoc; 
    }).filter(x=>x.polluxData);

    return res.json(final);

    //const top100 = await DB.localranks.get({user:userID,server:serverID},{_id:0,__v:0}).sort({exp:-1}).limit(100).lean();
})

router.get('/:userID', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;

    let userData = await DB.localranks.get({user:userID,server:serverID},{_id:0,__v:0});
    res.json(userData);
})

router.post('/factor', async (req,res)=>{
    const serverID = res.locals.serverID;
    const factorA = ~~(Number(req.body.A)) || 180;
    const factorB = ~~(Number(req.body.B)) || 8;

    if(!factorA < 0 || factorB < 0) return res.status(400).json("Invalid upFactors"); 

    DB.servers.set(serverID,{$set:{"progression.upfactorA": factorA, "progression.upfactorB": factorB }})
        .then(_=> res.status(200).json(newUpfactor))
        .catch(err=> console.log(err) && res.status(500).json("Error"));

})

router.post('/:userID/edit', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;
    const amount   = Math.max( ~~Number(req.body.amount) || 0 , 0 ); 
    const {upfactorA:A,upfactorB:B} = (await DB.servers.get(serverID)).progression;

    DB.localranks.set({user:userID,server:serverID},{$set:{
        exp:amount,
        level: ~~( Math.sqrt( (amount * B) / A ) )
    }})
        .then(_=> res.status(200).json( _ ));
})

router.post('/:userID/increment', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;
    const amount   = req.body.amount; 

    DB.localranks.set({user:userID,server:serverID},{$inc:{exp:amount}})
        .then(_=> res.status(200).json(amount));
})



router.delete('/nuke', async (req,res)=>{
    const serverID = res.locals.serverID;
    const userID = req.user.id;
    await DB.servers.set(serverID, {$set: {"progression.lastNuke": new Date(), "progression.lastNukeUser": userID }});
    DB.localranks.deleteMany({server:serverID})
        .then(_=> res.status(200).json(_));
})


module.exports = router