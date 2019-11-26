

// const DB = require('../database')
// const gear = require('../../../v7/core/gearbox')
const express = require('express')
const router = express.Router()

router.get('/', async function (req, res) {

  const PARTS= await serverDB.find({partner:true});
/*
    const    PARTS = await DB.serverDB.aggregate([
      {$match: {partner:true}},
      {$lookup:{
          from: "sv_metadata",
          localField: "id",
          foreignField: "id",
          as: "meta"
      }},     
      {$unwind : "$meta"},
      {$project: {_id: 0 , userdata:{channels:0,roles:0}} },        
  ]);

*/
  res.render('partners/partners_main' ,{partners:PARTS})
})
  

module.exports = router