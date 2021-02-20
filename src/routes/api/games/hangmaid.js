const express = require("express");
const router = express.Router();

const WORDS = require('./words.json');

router.get('/words', (req, res) => {
    const quantity = req.query.q
    res.json(quantity ? shuffle(WORDS).slice(0, quantity) : WORDS);
})

module.exports = router;