
// const DB = require('../database')
const express = require('express')
const bridge = express.Router()
const axios = require('axios')

bridge.post(['/:entrypoint/:endpoint','/:entrypoint'], (req,res)=>{
    console.log("ENTER")
    if(req.body.id){
        let url = `/${req.params.entrypoint}`+(req.params.endpoint?`/${req.params.endpoint}`:"")
       
        DB.servers.get(req.body.id || req.body.svID).then(sData=>{
            if(sData && sData.cluster){
                ports =  ["90"+(sData.cluster||"0").toString().padStart(2,"0")] 
            }else{
                ports = [9000,9001,9002,9003,9004]
            }
            console.log(ports)
            if(ports.length===1) return res.redirect(307,`78.47.50.59:${ports[0]}${url}`);
            let result = ports.map(port => {
                return axios.post(`78.47.50.59:${port}${url}`, req.body ).catch(e=>e.message);
            });
            Promise.all(result).then(_=> res.json(_.map(__=>(__||{}).data)) );
            
        }); 

    }else{
        res.sendStatus(400)
    }
}) 


module.exports = bridge


