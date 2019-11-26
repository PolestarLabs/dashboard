
// const DB = require('../database')
const express = require('express')
const router = express.Router()
const Canvas = require('canvas')

const GIFEncoder = require('gif-encoder');
const EventEmitter = require('events');
const path = require('path')
const fs = require('fs')

function tag(base, text,font,color) {

    font =  '600 18px "Corporate Logo Rounded"'
    color = color || '#fff'
    base.font = font;

    let H = base.measureText(text).emHeightAscent
    let h = base.measureText(text).emHeightDescent;
    let w = base.measureText(text).width;
    const item = new Canvas.createCanvas(w, h + H);
        let c = item.getContext("2d")
        c.antialias = 'subpixel';
        c.filter = 'best';
        c.font = font;
        c.fillStyle = color;
        c.fillText(text, 0, H);
    return item;
}

 


router.get("/boosterpack/:series/:A/:B/booster.png", async (req,res)=>{

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
    console.log({rarA,rarB,aNew,bNew,stkA})
    console.log('sdfsds')
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
    console.log('sdfsds2')
  
    
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

    let result = await canvas.toBuffer();
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    res.end(result);

});


router.get("/userio/:inout/:userID/minimal.png" , async (req,res) => {

    delete require.cache[ require.resolve('../../bot/core/utilities/Picto')]
    let Picto = require('../../bot/core/utilities/Picto')

    const inout  = req.params.inout
    const userID = req.params.userID
    const user = await PLX.getRESTUser(userID);

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

    let result = await canvas.toBuffer();
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    res.end(result);


})


router.get(["/booster/:pack/:B/:A/:Anew/:Bnew/output.gif", ], async (req, res) => {




    SERIES = req.params.pack;
    A =  req.params.A;
    B =  req.params.B;
    newA = req.params.Anew == "true";
    newB = req.params.Bnew == "true";
    CACHE_PATH = "cache/" + `${SERIES}-${A}-${B}-${newA}-${newB}` + ".gif";
    if (fs.existsSync(path.resolve(CACHE_PATH))) {
        return res.sendFile(path.resolve(CACHE_PATH))
    };


    const [boosterPack, stickerA, stickerB] = await Promise.all([
        Canvas.loadImage(HOST + "/build/boosters/showcase/" + SERIES + ".png"),
        Canvas.loadImage(HOST + "/stickers/" + A + ".png"),
        Canvas.loadImage(HOST + "/stickers/" + B + ".png")
    ]);
    const newe = await Canvas.loadImage(HOST + "/build/new.png");
    res.set('Content-Type', "image/gif");

    options ={
        w: 250,
        h: 250,
        lastFrame: 60,
        framerate: 48,
        filename: "test",
        cache: true,
        repeat: -1,
        highWaterMark: 64000

        //  transparentColor: 0x2C2F33,
    }

    let gif = new GIFEncoder(options.w || 100, options.h || 100);
    gif.writeHeader();
    gif.setRepeat(options.repeat || 0);
    gif.highWaterMark = options.highWaterMark || 128000;
    gif.setTransparent(options.transparentColor);
    gif.setFrameRate(options.framerate || 30);

    let buffers = []
    if (options.cache) {
      //  let resFile = createWriteStream(`cache/${options.filename || Date.now()}.gif`);
      //  gif.pipe(resFile);
    }
    gif.on('data', data => {buffers.push(data);});
    
    gif.once('end', async () => {
        let concat = Buffer.concat(buffers);
        fs.writeFile(CACHE_PATH, concat,()=>console.log('ok'));        
        res.send( Buffer.concat(buffers) );
        concat = null;
        //this.emit("done", {buffers:this.buffers,file:'cache/'+options.filename+'.gif'} );
    });


   
    
    //gif.gif.pipe(res);

    gif.setDispose(0)
    gif.setQuality(20)

    DISPLACE = 0
    RDX = 0.6
    RDX2 = .6



    function generate(fun) {
        let framesDone = 0
        let frameNumber = 0
        //Array(this.lastFrame).fill(null).forEach(async (n, frameNumber) => {
        while (frameNumber < options.lastFrame) {
            (async ()=> {
                let frame = fun(frameNumber);
                gif.addFrame(frame.getImageData(0, 0, options.w, options.h).data);
                framesDone++
                if (framesDone === options.lastFrame) gif.finish();
        })()
            frameNumber++
        }
    }


    generate(pandemonium);



    function pandemonium(frame) {
        canvas = Canvas.createCanvas(250, 250);
        ctx = canvas.getContext('2d');
        ctx.translate(-50, 0);

        ctx.globalCompositeOperation = "destination-over"

        //ctx.drawImage(Picto.tag(ctx, frame).item, 0, 0)

        if (frame < 5) {
            ctx.drawImage(boosterPack, 175 - boosterPack.width * RDX / 2, 0 + (0), 285 * RDX, 418 * RDX)
        } else if (frame < 20) {
            DISPLACE += 10 + frame - 20
            ctx.drawImage(boosterPack, 175 - boosterPack.width * RDX / 2, 0 + (DISPLACE), 285 * RDX, 418 * RDX)
        } else if (frame < 35) {
            DISPLACE += (frame - 19) / 2 + 1
            ctx.drawImage(boosterPack, 175 - boosterPack.width * RDX / 2, 0 + (DISPLACE), 285 * RDX, 418 * RDX)
        } else {
            ctx.drawImage(boosterPack, 175 - boosterPack.width * RDX / 2, 0 + (DISPLACE), 285 * RDX, 418 * RDX)
        }

        if (frame > 25) {
            DISPLACE += 1 / 2

            ctx.save()
            ctx.translate(350, 250);
            ctx.rotate((30 - 20) / 100 + ((frame - 36) / frame / (frame / 20)))
            ctx.translate(-350, -250);
            ctx.drawImage(stickerA, 175 - stickerA.width * RDX / 2 + Math.ceil((36 - 20) / 2) + 00, ((frame < 30 ? -frame - 20 : -50) + 50 + (.8 * (frame - 20)))               +00                     ,250 * RDX2, 250 * RDX2)
            ctx.rotate(-(30 - 20) / 100 + ((frame - 36) / frame))

            if (frame > 30) {
                ctx.restore()
                ctx.save()
                ctx.translate(-100, 250);
                ctx.rotate(- ((30 - 20) / 100 + ((frame - 36) / frame / (frame / 20))))
                ctx.translate(100, -250);
                ctx.drawImage(stickerB,10 -(frame - 20) + 175 - stickerA.width * RDX / 2 + Math.ceil((36 - 20) / 2), 10 + (frame < 30 ? -frame - 20 : -50) + 50 + (.8 * (frame - 20))  +20   , 250 * RDX2, 250 * RDX2)
                ctx.rotate(((30 - 20) / 100 + ((frame - 36) / frame / (frame / 20))))
            }
        }

        ctx.restore()

        if (frame > 35 && frame <= 40) {
            let DSP_I = 30
            let DSP_E = -20
            let tDSP = DSP_I + ((frame - 30) * ((DSP_E - DSP_I) / 9))
            if(newA) ctx.drawImage(newe, 50 + tDSP, 50, 50, 50);
            if(newB) ctx.drawImage(newe, 250 - tDSP, 50, 50, 50);
        }
        if (frame > 40) {
            let DSP_I = -20
            let DSP_E = 0
            let tDSP = DSP_I + ((10) * ((DSP_E - DSP_I) / 10))
            if (frame < 50) {
                tDSP = DSP_I + ((frame - 40) * ((DSP_E - DSP_I) / 10))
            }
            ctx.globalCompositeOperation = "source-over"
            if(newA) ctx.drawImage(newe, 50 + tDSP, 50, 50, 50);
            if(newB)ctx.drawImage(newe, 250 - tDSP, 50, 50, 50);
            ctx.globalCompositeOperation = "destination-over"
        }
        ctx.fillStyle = "#2266AA"//"#2C2F33"
        ctx.fillRect(0, 0, 350, 250)

        return ctx;
    }
    

   
       
        //msg.channel.send('', res)
   // });

})
 

router.get("/cooking-minigame/lunanuli.png", async (req,res) => {
    let Picto = require('../../bot/core/utilities/Picto')
    const canvas = Picto.new(800,600);
    const ctx = canvas.getContext('2d')
    
    let color = req.query.c;
    let img = await Picto.getCanvas(`${HOST}/build/events/hallowinter19/cooking/${color}.png`);
    ctx.drawImage(img,0,0);
    

    let result = await canvas.toBuffer();
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    res.end(result);
    
})

router.get("/event/furnace.png", async (req,res) => {
    let Picto = require('../../bot/core/utilities/Picto')
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


    let result = await canvas.toBuffer();
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    res.end(result);
    
})



router.get("/cooking-minigame/selenedi.png", async (req,res) => {

    const canvas = Canvas.createCanvas(825,600);
    const ctx = canvas.getContext('2d')
    let cooktop  = "main_off"
    let cauldron = false
    let smoke    = false
console.log(req.query)
    switch (Number(req.query.ct)) {
        case 1:
            cooktop = "main_lo";
            break;
        case 2:
            cooktop = "main_hi";
            break;
        default:
            cooktop = "main_off";
            break;
    }
    switch (Number(req.query.cd)) {
        case 1:
            cauldron = "still";
            break;
        case 2:
            cauldron = "simmer";
            break;
        case 3:
            cauldron = "bubbles";
            break;
        default:
            cauldron = false;
            break;
    }
    switch (Number(req.query.sk)) {
        case 1:
            smoke = "smoke1";
            break;
        case 2:
            smoke = "smoke2";
            break;
        default:
            smoke = false;
            break;
    }

    const X = await Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/"+cooktop+".png");
    const _cauld = cauldron ? await Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/"+cauldron+".png") : false;
    const _smoke = smoke ? await Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/"+smoke+".png") : false;

   ctx.drawImage(X,0,0)
   if(_cauld) ctx.drawImage(_cauld,0,0); 
   if(_smoke) ctx.drawImage(_smoke,0,0);

   let i=3
   while(i--){
       if(req.query.ut){
            let utensils = req.query.ut.split(',').slice(0,3)
            console.log(utensils)
            const [u1,u2,u3] = await Promise.all([
                Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[0]||4)+".png"),
                Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[1]||4)+".png"),
                Canvas.loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[2]||4)+".png")
            ]);
            
            try{
                ctx.drawImage(u1,460,468, 85,85);
            }catch(e){}
            try{
                ctx.drawImage(u2,460+90,468, 85,85);
            }catch(e){}
            try{
                ctx.drawImage(u3,460+180,468, 85,85);
            }catch(e){}
           
        }
   }

    let result = await canvas.toBuffer();
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    res.end(result);

})

module.exports = router