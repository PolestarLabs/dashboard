
// const DB = require('../database')
const express = require('express')
const router = express.Router()
const ImageCache = new Map()
 
router.use("/reload", async (req, res) => {
    console.log('reload')
    let removed = []
   Object.keys( require.cache).forEach(rq=>{
        if (rq.includes('generators/')) {
            delete require.cache[rq];
            removed.push(rq)
        }

    })
    return res.json(removed)
})


router.use("/roulette.png", async (...args) => {
   return (require('./roulette.js'))( ...args,ImageCache);
   
});

router.use("/discoin", async (...args) => {
    return (require('./discoin.js'))( ...args);
});

router.use("/boosterpack/", async (...args) => {
    return (require('./boosterpack.js'))( ...args);
});

router.use("/userio", async (...args) => {
    return (require('./user-io.js'))( ...args);
});


router.use(["/booster/:pack/:B/:A/:Anew/:Bnew/output.gif",], async (...args) => {
    return (require('./event/booster.js'))( ...args);
})

router.use("/event/furnace.png", async (...args) => {
    return (require('./event/furnace.js'))( ...args);
})

router.use("/cooking-minigame", async (...args) => {
    return (require('./event/cooking-minigame.js'))( ...args);
})

router.use("/repipe/:url", async (...args) => {


    let Picto = require('../../../bot/core/utilities/Picto')

    let base = await Picto.useCanvas(decodeURI(req.params.url));

    let newWidth = 300
    let newHeight = newWidth / base.width * base.height;

    const canvas = Picto.new(newWidth, newHeight);
    const ctx = canvas.useContext('2d')

    ctx.drawImage(base, 0, 0, newWidth, newHeight);

    res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Cache-Control': 'public, max-age=31557600'
    });
    canvas.createJPEGStream().pipe(res);



})




module.exports = router