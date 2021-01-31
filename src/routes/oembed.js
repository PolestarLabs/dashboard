
// const DB = require('../database')
const express = require('express')
const route = express.Router()
const axios = require('axios')
 
route.get(['/t'], (req,res)=>{
    res.render('standalone-pages/oembed-test') 

})
route.get(['/'], (req,res)=>{

    res.setHeader('type',"application/json+oembed")
    res.json({
        "version": "1.0",
         "type" : "rich",
         "title" : "Title",
         "author_name": "Author Name"
         ,"author_url":HOST
         ,"thumbnail_url":HOST + "/backdrops/bowsette3.png"
         ,"url":HOST + "/backdrops/bowsette3.png"
         ,"width":200
         ,"height":200
         ,"provider_name":"Pollux"
         ,"provider_url":HOST
         ,"field_0_name": "test"
         ,"field_0_value": "test"
         

    })

 
})


module.exports = route