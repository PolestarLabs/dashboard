const express = require('express');
const router = express.Router();


router.get('/', async (req,res)=>{
    
})

router.get('/top100', cacheFunction(600), async (req,res)=>{
    const serverID = res.locals.serverID;
    const top100 = await DB.localranks.find({server:serverID},{_id:0,__v:0}).sort({exp:-1}).limit(100).lean();
    const discordUsers = await Promise.all(top100.map(async RNK=>{
        let discordUser =   userCache.get( RNK.user ) || (await PLX.getRESTUser( RNK.user ).catch(e=>{ id: "error" }));
        if (!discordUser) return null;
        userCache.set(discordUser.id,discordUser);
        let {id,avatar,bot,discriminator,username} = discordUser;
        const response =  {id,avatar,bot,discriminator,username};
        response.polluxData = RNK ? {
            exp: RNK.exp, 
            level: RNK.level 
        } : null;
       
        return response;
    }));

    return res.json(discordUsers);    

})

router.get('/search', cacheFunction(60), async (req,res)=>{
    const serverID = res.locals.serverID;
    const query = req.query.q;
    const results = await PLX.searchGuildMembers(serverID, query, 20).catch((err) => []);
    const dbResults = await DB.localranks.find({server:serverID, user: {$in:results.map(r=>r.id)}},{_id:0,__v:0}).lean();
    
    const final = results.map(r=> {
        const newDoc = {};
        const polluxData = dbResults.find(d=>d.user===r.id) || null;
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

    DB.localranks.set({user:userID,server:serverID},{$set:{exp:amount}})
        .then(_=> res.status(200).json(amount));
})

router.post('/:userID/increment', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;
    const amount   = req.body.amount; 

    DB.localranks.set({user:userID,server:serverID},{$inc:{exp:amount}})
        .then(_=> res.status(200).json(newUpfactor));
})

module.exports = router