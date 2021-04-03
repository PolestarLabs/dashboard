const express = require("express");
const router = express.Router();

const WORDS = require('./words.json');

router.get('/words', (req, res) => {
    const {q: quant,t: theme,l: level} = req.query;
    const sendWords = WORDS.filter(w=>{
        if (theme && w.theme !== theme) return false;
        if (level && w.level !== parseInt(level)) return false;
        return true;
    });
    console.log({quant,theme,level,sendWords})
    res.json(quant ? shuffle(sendWords).slice(0, quant) : sendWords);
})

module.exports = router;