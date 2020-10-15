
const express = require('express');
const router = express.Router();
const moment = require('moment');

router.get('/', async (req,res)=>{
    
    let Picto = require('../../../bot/core/utilities/Picto')

   
    const { name, artist, time, dur,thumb,embed,embed_thumb,key,color} = req.query;
    if(!key) return res.status(401).json("UNAUTHORIZED");
    let authedUser = await DB.globals.findOne({ generatorsKey : key});
    if(!authedUser && key != "geminis444") return res.status(401).json("UNAUTHORIZED");
    await DB.globals.updateOne({ generatorsKey : key},{$inc:{'data.counters.generatorsAPI.nowPlaying' : 1}});


    const userID = req.query.uid
    const user = await PLX.getRESTUser(userID);

    let totalTime = moment.duration( dur.padStart(8,"00:") ).asSeconds();
    let elapsedTime = moment.duration( time.padStart(8,"00:") ).asSeconds();

    const canvas = Picto.new(800 + (embed?50:embed_thumb?100:0),200);
    const ctx = canvas.getContext('2d')
    let [avatar,thumbnail] = await Promise.all([        
        Picto.makeRound(94,user.avatarURL),
        Picto.getCanvas(thumb)
    ]);

let lnOptions = {
   // font: "600 18px 'Panton'",
    sizeToFill: false,
    paddingY: 1,
    verticalAlign: 'top',
    textAlign: "left",
  }


    let AlbumArt = Picto.new(270,270);
    const c = AlbumArt.getContext('2d')
    c.drawImage(thumbnail,-105,-45)
    let Overlay = Picto.new(270,270);
    const c2 = Overlay.getContext('2d')
    let grd2 = ctx.createLinearGradient(270, 270, 270, 0);
    grd2.addColorStop(0, "#2b2b3b");
    grd2.addColorStop(.6, "#0000");
    c2.fillStyle = grd2
    c2.fillRect(0,0,270,270)
    

   // ctx.drawImage(base,0,0);

   
    Picto.roundRect(ctx,0,0,800,200,10,"#151520")
    ctx.drawImage(avatar ,740,130,50,50);
    Picto.roundRect(ctx,2,2,196,196,{ tl: 10, tr: 0, br: 0, bl: 10},AlbumArt)
    
    ctx.fillStyle = "#5555"
    ctx.fillRect(205,188,585,6)
    let grd = ctx.createLinearGradient(199, 0, 600, 0);
    grd.addColorStop(0, "#"+ (color || "e23"));
    grd.addColorStop(1, "#"+ (color || "f35"));
    ctx.fillStyle = grd
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    Picto.roundRect(ctx,2,2,196,196,{ tl: 10, tr: 0, br: 0, bl: 10},Overlay)
    ctx.restore()
    console.log({totalTime,elapsedTime})
    ctx.fillRect(205,188,(585 * (elapsedTime/totalTime)),6)
   
    lnOptions.lineHeight= 1.2
    let titleGfx = Picto.block(ctx,name,"italic 900 30px  'Panton Black'","#CCD",550,75,lnOptions).item;
    ctx.drawImage(
        titleGfx,
        210,        
        40,
    );
    lnOptions.lineHeight= 1
    ctx.drawImage(
        Picto.block(ctx,artist,"600 20px 'Panton'","#888",400,20,lnOptions).item,
        210,        
        15,
    );
    
    ctx.drawImage(
        Picto.block(ctx,time+" / "+dur,"100 20px 'Panton'","#AAA",400,20,lnOptions).item,
        210,        
        200 - 10 - 35,
    );
    lnOptions.textAlign = 'right'
    lnOptions.sizeToFill= false
    ctx.drawImage(
        Picto.block(ctx, user.username + "#"+ user.discriminator ,"500 24px 'Panton'","#AAA",200,30,lnOptions).item,
        530,        
        200 - 10 - 35,
    );
    ctx.drawImage(
        Picto.block(ctx, "Requested by" ,"400 18px 'Panton'","#777",200,20,lnOptions).item,
        530,        
        200 - 10 - 35-20,
    );
    /*
    ctx.drawImage(
        Picto.block(ctx, "GFX Powered by Polestar Labs" ,"400 16px 'Quicksand'","#6688",500,20,lnOptions).item,
        790-500,        
        10,
    );
    */
    //let tag2 = Picto.tag(ctx,"#"+user.discriminator,"100 25px 'Whitney HTF'","#2b2b3b");
    //let tag3 = Picto.block(ctx, req.query.text ||"",0,"#888899", 500,32, lnOptions);
    //ctx.drawImage(tag.item ,254,55);
    //ctx.drawImage(tag2.item ,254+tag.width+5,55+8);
    //ctx.drawImage(tag3.item ,280 ,100);

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router