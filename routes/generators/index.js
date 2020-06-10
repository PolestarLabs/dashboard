
// const DB = require('../database')
const express = require('express')
const router = express.Router()
const ImageCache = new Map()
 
router.get("/reload", (req, res) => {
    res.send('unavailable')
})


router.get("/roulette.png", async (req, res) => {
    return (require('./roulette.js'))(ImageCache, ...args);
});

router.get("/discoin", async (req, res) => {
    return (require('./discoin.js'))(ImageCache, ...args);
});

router.get("/boosterpack/", async (req, res) => {
    return (require('./boosterpack.js'))(ImageCache, ...args);
});

router.get("/userio", async (req, res) => {
    return (require('./user-io.js'))(ImageCache, ...args);
});


router.get(["/booster/:pack/:B/:A/:Anew/:Bnew/output.gif",], async (...args) => {
    return (require('./event/booster.js'))(ImageCache, ...args);
})

router.get("/event/furnace.png", async (...args) => {
    return (require('./event/furnace.js'))(ImageCache, ...args);
})

router.get("/cooking-minigame", async (req, res) => {
    return (require('./event/cooking-minigame.js'))(ImageCache, ...args);
})

router.get("/repipe/:url", async (req, res) => {


    let Picto = require('../../../bot/core/utilities/Picto')

    let base = await Picto.getCanvas(decodeURI(req.params.url));

    let newWidth = 300
    let newHeight = newWidth / base.width * base.height;

    const canvas = Picto.new(newWidth, newHeight);
    const ctx = canvas.getContext('2d')

    ctx.drawImage(base, 0, 0, newWidth, newHeight);

    res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Cache-Control': 'public, max-age=31557600'
    });
    canvas.createJPEGStream().pipe(res);



})




module.exports = router