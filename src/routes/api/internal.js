const express = require('express');
const router = express.Router();

const ServicePings = new Map();


router.get('/ping', async (req,res)=>{
    
    let PINGS = await DB.globals.findOne({ id: 1 , type: "pings" }).lean();
    console.log(PINGS)

    if (req.query.filter){
        PINGS = PINGS[req.query.filter];
        if (!PINGS) return res.status(404).json("NOT FOUND");
    }

    res.json(PINGS);

})

router.post('/ping', async (req,res)=>{
    console.log(req.body)
    try{
        const {instance, cluster, last,diff} = req.body;
        if(!instance || !last)  return res.status(400).json("ERROR");
        await DB.globals.updateOne({ id: 1 , type: "pings" }, {[instance]: {["cluster_"+cluster]: {last: new Date(last).getTime(), diff } }},{upsert:true});
        return res.status(200).json("OK");

    }catch(err){
        console.error(err)
        res.status(500).json("ERROR")
    }
    
  
})

module.exports = router