// const DB = require('../database')
const express = require('express')
const router = express.Router()
const fx = require('../pipelines/globalFunctions.js');

router.get('/', function (req, res) {
  res.render('events/events')
})

router.get('/:id', async function (req, res) {
  //let u = fx.userBasics(req.user);

  let event = req.params.id
  let legacy = [
    "halloween_2017",
    "halloween18",
    "solstice18",
    "xmas17",
    "easter2018",
  ] 
  if(legacy.includes(event)){
    var path = require('path');
   return res.sendFile(path.resolve('legacy/'+event+'.html'))
  }

  res.render('events/' + req.params.id )

})
module.exports = router