const express = require('express');
const router = express.Router();


router.post('/', async (req,res)=>{
    console.log(req.body,'post')
    res.status(200).json("OK")   
})


router.get('/', async (req,res)=>{
    console.log(req.body,'get')
    res.status(200).json("OK")   
})


module.exports = router