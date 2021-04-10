
// const DB = require('../database')
const express = require('express')
const route = express.Router()
const axios = require('axios')
 
route.get(['/t'], (req,res)=>{
    res.render('standalone-pages/oembed-test') 

})
route.get(['/'], (req,res)=>{
    res.setHeader('type',"application/json+oembed");
    let payload = req.query?.payload;
    if(payload){

        let oembed = JSON.parse( payload );
        console.log({oembed})
        return res.json( oembed );
    }
    else{
        return res.status(400).json("NO PAYLOAD")
    } 
})


module.exports = route