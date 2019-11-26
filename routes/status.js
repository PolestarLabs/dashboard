// const DB = require('../database')
const express = require('express')
const router = express.Router()


router.post('/', async (req,res,nex)=> {

    await DB.globalDB.set({
        $push:{
            'data.statusTrack':{
                $each:[req.body],

                $sort: {timestamp:1},
                $slice: -11000
            },
            
        }
    });
   // console.table(req.body)
    res.sendStatus(200)
  } );


router.get('/' ,async (req,res,nex)=>{ 

    const globalDB = await DB.globals.get();
    let statusDatabase = globalDB.statusTrack
    statusDatabase = statusDatabase.sort((a,b)=> a.timestamp-b.timestamp).slice(-3000)
    res.render('statuspage/base',{statusDatabase})

})

router.get('/piece' ,async (req,res,nex)=>{ 
    const globalDB = await DB.globals.get();
    let statusDatabase = globalDB.statusTrack
    statusDatabase = statusDatabase.sort((a,b)=> a.timestamp-b.timestamp).slice(-3000)
    res.render('statuspage/statustick',{statusDatabase})
})


module.exports = router