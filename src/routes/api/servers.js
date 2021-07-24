
const express = require('express');
const router = express.Router(); 

router.get('/:id', cache(30), async (req,res) => {
    if (!req.user) return res.status(401).json("Nope");

    const {id:svID} = req.params 
    const serverData = await DB.servers.get(svID);
    const serverMetaData = await DB.svMetaDB.get(svID);

    if (!serverData) return res.status(404).json("Not in Database");
    if (!serverMetaData) return res.status(404).json("No metadata in Database");
    const payload = JSON.parse(JSON.stringify(serverData));
    payload.meta  = JSON.parse(JSON.stringify(serverMetaData));
    payload.clientID  = PLX.id;

    return res.json( payload );
})
  
module.exports = router;