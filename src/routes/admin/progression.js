const express = require('express');
const router = express.Router();


router.get('/', async (req,res)=>{
    
})
router.get('/:userID', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;

    let userData = await DB.localranks.get({user:userID,server:serverID},{_id:0,__v:0});
    res.json(userData);
})

router.post('/factor', async (req,res)=>{
    const serverID = res.locals.serverID;
    const newUpfactor = req.body.value;

    DB.servers.set(serverID,{$set:{"modules.UPFACTOR": newUpfactor }})
        .then(_=> res.status(200).json(newUpfactor))
        .catch(err=> console.log(err) && res.status(500).json("Error"));

})

router.post('/:userID/edit', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;
    const amount   = req.body.amount; 

    DB.localranks.set({user:userID,server:serverID},{$set:{exp:amount}})
        .then(_=> res.status(200).json(newUpfactor));
})

router.post('/:userID/increment', async (req,res)=>{
    const serverID = res.locals.serverID;
    const {userID} = req.params;
    const amount   = req.body.amount; 

    DB.localranks.set({user:userID,server:serverID},{$inc:{exp:amount}})
        .then(_=> res.status(200).json(newUpfactor));
})

module.exports = router