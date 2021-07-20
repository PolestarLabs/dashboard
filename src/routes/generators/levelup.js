const Picto = require( process.env.BOT_PATH + '/core/utilities/Picto.js');
const Anim = require( process.env.BOT_PATH + '/core/structures/Animation.js');
const RANGE = [...Array(31).keys()].slice(1);

global.lvupCacheReady ??= false;
//const waitingAll = Promise.all( RANGE.map(async x => await Picto.getCanvas(`${HOST}/build/level up_frames/transp/lvup_frame_${x}.png`))).then(res=> {global.lvupCacheReady=true; global.lvupFramesCache = res});
const waitingAll = Promise.all( RANGE.map(async (x,i) => await Picto.getCanvas(`${HOST}/generators/levelupframe.png?f=${i}`))).then(res=> {global.lvupCacheReady=true; global.lvupFramesCache = res});
//let lvupMaskCache = Promise.all( RANGE.map(async x => await Picto.getCanvas(`${paths.BUILD}/level up_frames/mask/mk_${x}.gif`))).then(res=> {cacheStatus++; lvupMaskCache = res});


module.exports = async function(req,res){
   
    cacheReady = !!global.lvupCacheReady;


    let args = [200,200]
    const [argLv,user] = args;

    const canvas = Picto.new(800,300);
    const ctx = canvas.getContext('2d');
    
    const avatar = await Picto.getCanvas( req.query.avatar || "" );

    console.log({cacheReady})
    if (!cacheReady) await waitingAll;
    lvupFramesCache = global.lvupFramesCache;
    
    console.log({cacheReady})
    
    let GIF = new Anim({
        w: 800, h: 300,
        filename: (req.query.uid||"nouserid") +"-"+ (req.query.level||0),
        lastFrame: 57*2 + 20,
        transparentColor: 0x00ff00,
        framerate: 35,
        quality:5,
        //repeat: -1,
        cache: req.query.cache || false
    });

    
    let LV_SIZE = 42; //52
    GIF.generate(function(actualFrame){
        let frame = actualFrame > 56 ? 57*2 - actualFrame : actualFrame;
        
        if (actualFrame > 56*2) {
            ctx.fillStyle = '#00FF00'
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return ctx
        }      
        
        ctx.drawImage(avatar,15 + Math.min( (10000 / Math.pow(20+frame,2)),45) ,0,320,320);
        //ctx.shadowColor = '#2b2b3b';
        //ctx.shadowBlur = 1;

        if (frame < 22) LV_SIZE = 42-22+frame*2;
        if (frame == 22) LV_SIZE = 44;
        if (frame == 23) LV_SIZE = 48;
        if (frame == 24) LV_SIZE = 52;
        if (frame == 25) LV_SIZE = 60;
        if (frame == 26) LV_SIZE = 70;
        if (frame == 27) LV_SIZE = 65;
        if (frame == 28) LV_SIZE = 60;
        if (frame == 29) LV_SIZE = 55;
        if (frame == 30) LV_SIZE = 52;
        
        if (frame > 30) LV_SIZE = 52;
        
        const lvTag = Picto.tag(ctx, $t("terms.levelUp", {lngs:['en']}) , "600 30px 'Quicksand'", "#223" ).item;
        const Level = Picto.tag(ctx, req.query.level , "900 "+LV_SIZE+"px 'Panton Black'", "#223" ).item;
        const lvWidth = Math.min(118,Level.width);
        const lvtWidth = Math.min(150,lvTag.width);
        
        console.log("drawing",frame)
        ctx.drawImage(lvupFramesCache[Math.min(frame,29)],0,0);

        if(frame > 20){
            ctx.drawImage(lvTag, 590 - lvtWidth, 124, lvtWidth, lvTag.height);
        }
        if (frame > 22){
            ctx.drawImage(Level, 660 - lvWidth / 2, (105+20) - (LV_SIZE/3) , lvWidth, Level.height);
        }

        return ctx
    });


    GIF.on('done',(gif)=>{
        res.status(200).header('Content-Type','image/gif').send(gif.file);
    })
}
/*
    GIF.on('done',(gif)=>{
        msg.channel.createMessage({
            content:' ' }, gif );
    })
    */