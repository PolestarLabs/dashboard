const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{
    
    let Picto = require('../../../bot/core/utilities/Picto')
    const canvas = Picto.new(600,600);
    const ctx = canvas.getContext('2d')
    const F =  Number(req.query.f)||0;
    const T = Number(req.query.t)||0;
    const Txt = req.query.txt
    
    const _furn = await Picto.getCanvas(HOST+"/build/events/hallowinter19/FURN2.png");
    let textF = Picto.tag(ctx,F||"NOPE","40px arial",'white');


    let tagA = Picto.tag(ctx, 888888, "64px 'digital-7'", "#111114");
    let tagB = Picto.tag(ctx, F, "64px 'digital-7'", "#10cfff");
    
    ctx.drawImage(_furn,0,0)
    ctx.fillStyle = "#e83f5c"
    ctx.fillRect(505, 180, 5, 227)
    ctx.fillStyle = "#272431"
    ctx.fillRect(502, 180, 10, (220 -(T>0?T:0)*13 ) )

     
    let fSize = 40 
    let uname_w = Picto.popOutTxt(ctx, T+"°C", 448 ,480 ,fSize+"pt 'Panton Black','Corporate Logo Rounded' ","#FFF",130,{style:"#1B1B2B",line:14}).w;   
    let uname_2 = Picto.popOutTxt(ctx, Txt, 50 ,10 ,"20pt 'Panton Black','Corporate Logo Rounded' ","#FFF",320,{style:"#1B1B2B",line:7}).w;   
 
    ctx.globalAlpha = .5
    ctx.drawImage(tagA.item, 127, 327);
    ctx.globalAlpha = .7
    ctx.shadowBlur =5;
    ctx.shadowColor = "#10cfff";
    ctx.drawImage(tagB.item, 127+tagA.width-tagB.width, 327);
    ctx.globalAlpha = 1


    canvas.pngStream().pipe(res);
})

module.exports = router