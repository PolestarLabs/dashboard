const DB = require('../database')
require('../../bot/core/archetypes/Achievements.js')
const express = require('express')
const router = express.Router()
const fx = require('../pipelines/globalFunctions.js');

router.get('/', async (req,res)=>{
    const ACHDB = await DB.achievements.find({}).lean();
    const targdata = res.locals.userdata; 
    const checks    = await Achievements.check(targdata);
    res.render('achievements',{ACHDB,targdata,checks})

})

router.get('/:id', async (req,res)=>{
    const id = req.params.id == "me" ? req.user.id : res.redirect('/auth') ? req.user.id : req.params.id 
    const ACHDB     = await DB.achievements.find({}).lean();
    const targdata  = await DB.users.get(id);
    const checks    = await Achievements.check(targdata);

    console.log(checks);
    

    res.render('displays/achievements',{ACHDB,targdata,checks})
})

 
module.exports = router