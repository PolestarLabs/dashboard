const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{
    
    const gallery = await DB.collections.fanart.find({/*author_ID: {$ne:'88120564400553984'},*/ publish: true }).toArray();
    console.log(gallery)
    
    res.render('gallery/fanart',{gallery})
})

module.exports = router