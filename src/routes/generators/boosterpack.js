
const express = require('express');
const router = express.Router();
const Canvas = require('canvas') 

function tag(base, text,font,color) {

    font =  font || '600 18px "Corporate Logo Rounded"'
    color = color || '#fff'
    base.font = font;

    let H = base.measureText(text).emHeightAscent
    let h = base.measureText(text).emHeightDescent;
    let w = base.measureText(text).width+20;
    const item = new Canvas.createCanvas(w, h + H);
        let c = item.getContext("2d")
        c.antialias = 'subpixel';
        c.filter = 'best';
        c.font = font;
        c.fillStyle = color;
        c.fillText(text, 0, H);
    return item;
}
router.get('/:series/:A/:B/booster.png', async (req,res)=>{

        
    const canvas = Canvas.createCanvas(400,250);
    const ctx = canvas.getContext('2d')
    const stickerBase = await  DB.cosmetics.find({type:'sticker'});
    stkA    = req.params.A
    stkB    = req.params.B
    rarA    = stickerBase.find(st=>st.id === stkA).rarity
    nameA   = stickerBase.find(st=>st.id === stkA).name
    rarB    = stickerBase.find(st=>st.id === stkB).rarity
    nameB   = stickerBase.find(st=>st.id === stkB).name
    series  = req.params.series
    aNew    = req.query.anew=="true"
    bNew    = req.query.bnew=="true"

    const [ stickerA,stickerB,nametagA,nametagB,rarityA,rarityB,boosterPack,rbnShadow,isNew] = await Promise.all([
       
        Canvas.loadImage(HOST+`/stickers/${stkA}.png`),
        Canvas.loadImage(HOST+`/stickers/${stkB}.png`),
        Canvas.loadImage(HOST+`/build/boosters/nametag_${rarA}.png`),
        Canvas.loadImage(HOST+`/build/boosters/nametag_${rarB}.png`),
        Canvas.loadImage(HOST+`/build/tiers/mettalic/${rarA}.png`),
        Canvas.loadImage(HOST+`/build/tiers/mettalic/${rarB}.png`),
        Canvas.loadImage(HOST+`/build/boosters/showcase/${series}.png`),
        Canvas.loadImage(HOST+`/build/boosters/rubineshadow.png`),
        Canvas.loadImage(HOST+`/build/new.png`),
    ]);
  
    
    ctx.translate(-30,115)
    ctx.rotate(-30 * Math.PI/180) 
    ctx.globalAlpha = .2
    ctx.drawImage(
        boosterPack
        ,195-boosterPack.width*.85/2
        ,125-boosterPack.height*.85/2
        ,boosterPack.width * 0.85
        ,boosterPack.height * 0.85
        )
    ctx.globalAlpha = 1
    ctx.rotate(30 * Math.PI/180) 
    ctx.translate(30,-115)

    ctx.shadowColor = "#2b2b3b55"
    ctx.shadowOffsetY = 1
    ctx.shadowBlur = 1
    
    ctx.drawImage(nametagB, 0 , 0 )
    ctx.rotate(180 * Math.PI/180) 
    ctx.shadowOffsetY = -1
    ctx.drawImage(nametagA, -400 , -250)
    ctx.rotate(-180 * Math.PI/180)    
    ctx.shadowOffsetY = 1
    
    ctx.shadowBlur = 4

    ctx.translate(120,115)
    ctx.rotate(15 * Math.PI/180) 
    ctx.drawImage(stickerB, -100 , -50, 180,180 )
    ctx.rotate(-15 * Math.PI/180) 
    ctx.translate(-120,-115)
    
    ctx.translate(400-105,85)
    ctx.rotate(15 * Math.PI/180) 
    ctx.drawImage(stickerA, -75 , -75, 180,180 )
    ctx.rotate(-15 * Math.PI/180) 
    ctx.translate(-(400-105),-85)

  
    ctx.shadowOffsetX = 0
    ctx.shadowBlur = 2

    ctx.drawImage( tag(ctx,nameA), 60 , 25 );
    let nameBimg = tag(ctx,nameB)
    ctx.drawImage( nameBimg, 400-60-nameBimg.width , 208 );
    
    ctx.shadowBlur = 4

    ctx.drawImage(rarityA,0,0,60,60)
    ctx.drawImage(rarityB,400-60,250-60,60,60)
    
    aNew ? ctx.drawImage(isNew,400-60,0,60,60) : null;
    bNew ? ctx.drawImage(isNew,0,250-60,60,60) : null;
 
    res.writeHead(200, {'Content-Type': 'image/png'});
    canvas.pngStream({ compressionLevel: 2, filters: 0 }).pipe(res);

})

module.exports = router