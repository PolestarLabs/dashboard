const express = require('express');
const router = express.Router();

//DB.usercols
router.get('/user/:userID', async (req,res)=>{
    const {userID} = req.params;
    const userCollection = await DB.usercols.get(userID);
    if (!userCollection) return res.status(404).json( "USER NOT FOUND" );
    const {collections} = userCollection;
    return res.status(200).json( collections.playlist || [] );    
})

router.post('/user/:userID', async (req,res)=>{
    const {userID} = req.params;
    const track = req.body;
    if (!track) return res.status(400).json( "BAD REQUEST: NO BODY");
    await DB.usercols.set(userID, {$addToSet: {"collections.playlist": track} });
    return res.status(200).json( "OK" );    
})

router.delete('/user/:userID', async (req,res)=>{
    const {userID} = req.params;
    const track = req.body.url;
    if (!track) return res.status(400).json( "BAD REQUEST: NO BODY");
    await DB.usercols.set( {id:userID,'collections.playlist.url':track}, {$set: {"collections.playlist.$": 1} });
    await DB.usercols.set( userID, {$pull: {"collections.playlist": 1} });
    return res.status(200).json( "OK" );    
})


module.exports = router

