
const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{
    
    let Picto = require(process.env.BOT_PATH+"/core/utilities/Picto")

    const canvas = Picto.new(342,185);
    //114 108
    const ctx = canvas.getContext('2d')

    let carl = await Picto.getCanvas(HOST + "/build/carl.png");

    let tag = Picto.block(ctx, req.query.t || "I get nervous around cute furries", "12pt 'Segoe UI'", color = "#b4b4b8", W = 230, H = 36, {});
    //tag(ctx, req.query.t || "I get nervous around cute furries" ,"900 32px 'Whitney HTF'","#2b2b3b");
    
    ctx.drawImage(carl ,0 ,0);
    ctx.drawImage(tag.item ,110 ,102);

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router