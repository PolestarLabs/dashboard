
const express = require("express");
const router = express.Router();




router.get('/words', (req, res) => {
    const quantity = req.params.q
    if (quantity) {
        const words = require('./words.json')
        res.json(shuffle(words).slice(0, quantity)).writeHead(200, {
            'Content-Type': 'application/json'
        })
    } else {
        res.json(words).writeHead(200, {
            'Content-Type': 'application/json'
        })
    }
})


module.exports = router;
