
const express = require('express');
const router = express.Router();

router.get('/:inout/:userID/minimal.png', async (req,res)=>{
    
    let Picto = require(process.env.BOT_PATH+"/core/utilities/Picto")

    const inout  = req.params.inout
    const userID = req.params.userID
    const user = await userCache.get(userID);

    const canvas = Picto.new(800,150);
    const ctx = canvas.getContext('2d')
    let [base,avatar] = await Promise.all([
        Picto.getCanvas(HOST+`/build/welcome/minimal/${inout}.png`),
        Picto.makeRound(94,user.avatarURL)
    ]);

let lnOptions = {
    font: "100 18px 'Corporate Logo Rounded'",
    sizeToFill: false,
    paddingY: 2,
    verticalAlign: 'top',
    textAlign: "left",
  }
    ctx.drawImage(base,0,0);
    ctx.drawImage(avatar ,145,28,94,94);
    let tag = Picto.tag(ctx,user.username,"900 32px 'Whitney HTF'","#2b2b3b");
    let tag2 = Picto.tag(ctx,"#"+user.discriminator,"100 25px 'Whitney HTF'","#2b2b3b");
    let tag3 = Picto.block(ctx, req.query.text ||"",0,"#888899", 500,32, lnOptions);
    ctx.drawImage(tag.item ,254,55);
    ctx.drawImage(tag2.item ,254+tag.width+5,55+8);
    ctx.drawImage(tag3.item ,280 ,100);


    res.status(200).header('Content-Type','image/png').send( await canvas.png );
})

module.exports = router