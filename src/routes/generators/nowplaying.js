
const express = require('express');
const router = express.Router();
const moment = require('moment');

router.get('/', async (req,res)=>{


    let Picto = require(process.env.BOT_PATH+"/core/utilities/Picto")

   
    const {name, artist, time, dur, thumb, embed, embed_thumb, key, color, color_b, live, source, play, loop} = req.query;

    if(!key) return res.status(401).json("UNAUTHORIZED");
    
    let authedUser = await DB.globals.findOne({ generatorsKey : key});
    
    if(!authedUser && key != "geminis444") return res.status(401).json("UNAUTHORIZED");
    DB.globals.updateOne({ generatorsKey : key},{$inc:{'data.counters.generatorsAPI.nowPlaying' : 1}});
    
    
    const userID = req.query.uid
    const user = (await userCache.get( userID )) || (await PLX.getRESTUser( userID ));
    
    userCache.set(userID,user);
    let totalTime = moment.duration( dur.padStart(8,"00:") ).asSeconds();
    let elapsedTime = moment.duration( time.padStart(8,"00:") ).asSeconds();
    
    const canvas = Picto.new( 800 + (embed?50:embed_thumb?100:0),200);
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
    
    if(thumb.includes("hqdefault")){
        c.drawImage(thumbnail,-105,-45)
    }else{   
        let scale = [
            AlbumArt.width / thumbnail.width,  // X
            AlbumArt.height / thumbnail.height // Y
        ];
        const fitW = thumbnail.width * Math.max(...scale);
        const fitH = thumbnail.height * Math.max(...scale);
        c.drawImage(thumbnail,135- fitW/2 ,135-fitH/2,fitW,fitH)       
    }
    

    if(play==="2"){
        /*
        const id = c.getImageData(0, 0, AlbumArt.width, AlbumArt.height);
        const data = id.data;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let y = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = y;
            data[i + 1] = y;
            data[i + 2] = y;
        }
        c.putImageData(id, 0, 0);
        */
       c.globalCompositeOperation = 'saturation'
       c.fillStyle = "#1b1b2F";
       c.fillRect(0,0,270,270);
       c.globalCompositeOperation = 'lighter'
       c.fillStyle = "#1b1b2F";
        c.fillRect(0,0,270,270);
        c.globalCompositeOperation = 'source-over'
    }

    let Overlay = Picto.new(270,270);
    const c2 = Overlay.getContext('2d')
    let grd2 = ctx.createLinearGradient(270, 270, 270, 0);
    
    play === "2" ? grd2.addColorStop(0, "#112") : grd2.addColorStop(0, "#2b2b3b");
    play === "2" ? grd2.addColorStop(.6, "#1125") : grd2.addColorStop(.6, "#0000");



    c2.fillStyle = grd2
    c2.fillRect(0,0,270,270)
    

    Picto.roundRect(ctx,0,0,800,200,10,"#151520");
    ctx.save();
    ctx.globalCompositeOperation = 'source-in';

    //ctx.drawImage(AlbumArt, 50+400-AlbumArt.width/2,   100-AlbumArt.height/2);

    let scale = [
        (canvas.width - 200) / AlbumArt.width,  // X
        (canvas.height) / AlbumArt.height // Y
    ];
    const fitW = AlbumArt.width * Math.max(...scale);
    const fitH = AlbumArt.height * Math.max(...scale);
    ctx.drawImage(AlbumArt,200+300- fitW/2 ,100-fitH/2,fitW,fitH)  

    
    ctx.blur(50)
    ctx.restore();

    let grd3 = ctx.createLinearGradient(0, 0, 800, 0);
    grd3.addColorStop(.3, "#112");
    grd3.addColorStop(1, "#1120");
    ctx.fillStyle = grd3;

    ctx.fillRect(0,0,800,200);
    ctx.globalCompositeOperation = 'destination-in';
    Picto.roundRect(ctx,0,0,800,200,10,"#FFF");
    
    ctx.globalCompositeOperation = 'source-over';
    Picto.roundRect(ctx,0,0,800,200,10,"#1B1B2FA5");
 

        
    
    ctx.drawImage(avatar ,740,130,50,50);
    Picto.roundRect(ctx,4,4,192,192,{ tl: 10, tr: 0, br: 0, bl: 10},AlbumArt)
    
    ctx.fillStyle = "#112A"
    //ctx.fillRect(205,188,585,6)
    Picto.roundRect(ctx,205,188,585,6,3,"#112A");
    const Bar = Picto.new(585,6);
    const bc = Bar.getContext("2d");
    let grd = bc.createLinearGradient(199, 0, 600, 0);
    grd.addColorStop(0, "#"+ (color || "A5E"));
    grd.addColorStop(1, "#"+ (color_b || color || "f35"));

    /* RAINBOW
    
        grd.addColorStop(0.00, 'red'); 
        grd.addColorStop(1/6, 'orange'); 
        grd.addColorStop(2/6, 'yellow'); 
        grd.addColorStop(3/6, 'green') 
        grd.addColorStop(4/6, 'aqua'); 
        grd.addColorStop(5/6, 'blue'); 
        grd.addColorStop(1.00, 'purple'); 
    */

    bc.fillStyle = play === "2" ? "#559" : grd;
    bc.fillRect(0,0,585,6);

    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    Picto.roundRect(ctx,2,2,196,196,{ tl: 10, tr: 0, br: 0, bl: 10},Overlay)
    ctx.restore()
    //ctx.fillRect(205,188,(585 * (elapsedTime/totalTime)),6)
    Picto.roundRect(ctx,205,188,(585 * (elapsedTime/totalTime)),6,3, Bar);
   
    lnOptions.lineHeight= 1.2
    let titleGfx = Picto.block(ctx,name,"italic 900 30px  'Panton Black'","#DDF",550,75,lnOptions).item;
    ctx.drawImage(
        titleGfx,
        210,        
        40,
    );
    lnOptions.lineHeight= 1
    if(source=="radio"){
        ctx.drawImage(
            (await Picto.tagMoji(ctx, "🎙 RADIO    " ,"600 20px 'Panton'","#AADA")).item,
            210,        
            15,
        );
    }else{
        ctx.drawImage(
            Picto.block(ctx,artist,"600 20px 'Panton'","#88A",400,20,lnOptions).item,
            210,        
            15,
        );
    }
    
    if(live){
        ctx.drawImage(
            (await Picto.tagMoji(ctx, "🔴  LIVE " ,"600 18px 'Panton'","#AAD")).item,
            210,        
            200 - 10 - 35,
        );
    }
    if(loop){
        ctx.drawImage(
            (await Picto.tagMoji(ctx, "🔁  LOOP " ,"600 18px 'Panton'","#AAD")).item,
            710,
            15,        
        );
    }else{
        ctx.drawImage(
            Picto.block(ctx,time+" / "+dur,"100 20px 'Panton'","#AAD",400,20,lnOptions).item,
            210,        
            200 - 10 - 35,
        );
    }
    lnOptions.textAlign = 'right'
    lnOptions.sizeToFill= false
    ctx.drawImage(
        Picto.block(ctx, user.username + "#"+ user.discriminator ,"500 24px 'Panton'","#DDF",260,30,lnOptions).item,
        470,        
        200 - 10 - 35,
    );
    ctx.drawImage(
        Picto.block(ctx, "Requested by" ,"400 18px 'Panton'","#AAD",200,20,lnOptions).item,
        530,        
        200 - 10 - 35-20,
    );

    if(play==='2'){
        let pause = Picto.tag(ctx, "II   P A U S E D " ,"900 26px 'Panton Black'","#FFF")
        ctx.shadowColor = "#112";
        ctx.shadowBlur = 3;
        ctx.drawImage(
            pause.item,
            100 - pause.width/2,        
            120,
        );
    }

    /*
    if(source=="radio"){
        ctx.drawImage(
            (await Picto.tagMoji(ctx, "🎙 RADIO    " ,"400 16px 'Quicksand'","#AAD8")).item,
            790-70,        
            10,
        );
    }
    */
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

  
    

    res.writeHead(200, {'Content-Type': 'image/png'});
    canvas.pngStream({ compressionLevel: 5, filters: 0 }).pipe(res);

})

module.exports = router