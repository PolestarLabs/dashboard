
// const DB = require('../database')
const express = require('express')
const router = express.Router()
const ImageCache = new Map()
 
router.use( '/reload', async (req, res,next) => {
    console.log('reload')
    let removed = []
   Object.keys( require.cache).forEach(rq=>{
        if (rq.includes('generators/')) {
            delete require.cache[rq];
            removed.push(rq)
        }

    })
    next()
})

//router.use(cacheFunction(10000))

router.use("/roulette.png", async (...args) => {
    delete require.cache[require.resolve('./roulette')];
    return (require('./roulette.js'))( ...args,ImageCache);
   
});
router.use("/nowplaying.png", async (...args) => {
    delete require.cache[require.resolve('./nowplaying')];
    return (require('./nowplaying.js'))( ...args,ImageCache);
   
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

router.use("/hangmaid", async (req,res) => {
    if(req.query.refresh) delete require.cache[require.resolve('./hangmaid')];
    return (require('./hangmaid.js'))(req,res);
});


router.use(["/booster/:pack/:B/:A/:Anew/:Bnew/output.gif",], async (...args) => {
    return (require('./booster.js'))( ...args);
})

router.use("/event/furnace.png", async (...args) => {
    return (require('./event/furnace.js'))( ...args);
})

router.use("/cooking-minigame", async (...args) => {
    return (require('./event/cooking-minigame.js'))( ...args);
})

router.use("/flag", async (...args) => {
    return (require('./flag.js'))( ...args);
})

router.use("/ship.png", async (...args) => {
    return (require('./ship.js'))( ...args);
})

router.use("/weather.png", async (req,res) => {
    if(req.query.refresh) delete require.cache[require.resolve('./weather.js')];
    return (require('./weather.js'))(req,res);
})

router.use("/repipe/:url", async (req,res) => {

    let Picto = require('../../../../bot/core/utilities/Picto')

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