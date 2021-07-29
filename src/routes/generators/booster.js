const GIFEncoder = require('gif-encoder');
const EventEmitter = require('events');
const path = require('path')
const fs = require('fs')
const Canvas = require('skia-canvas') 

module.exports = async function(req,res){


    SERIES = req.params.pack;
    A =  req.params.A;
    B =  req.params.B;
    newA = req.params.Anew == "true";
    newB = req.params.Bnew == "true";
    const CACHE_PATH = appRoot + "/cache/" + `${SERIES}-${A}-${B}-${newA}-${newB}` + ".gif";
    if (fs.existsSync((CACHE_PATH))) {
        console.log("FILE EXISTS")
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
        highWaterMark: 64000000

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
        console.log("GIF END")
        let concat = Buffer.concat(buffers);
        console.log("END WRITE AT ",CACHE_PATH)
        fs.writeFile(CACHE_PATH, concat,()=>console.log('ok'));        
        res.send( Buffer.concat(buffers) );
        //concat = null;
        //this.emit("done", {buffers:this.buffers,file:'cache/'+options.filename+'.gif'} );
    });


   
    
    //gif.gif.pipe(res);

    gif.setDispose(0)
    gif.setQuality(20)

    DISPLACE = 0
    RDX = 0.6
    RDX2 = .6



    function generate(fun) {
        console.log("RENDER START")
        let frameNumber = 0;
        renderedFrames = [];
        // Array(this.lastFrame).fill(null).forEach(async (n, frameNumber) => {
        
        Array(options.lastFrame-1).fill(" ").map((_,frameNumber)=>{
          const frame = fun(frameNumber);
          renderedFrames.push(frame);
        });
        renderedFrames.forEach(frame=>{
          gif.addFrame(frame.getImageData(0, 0, options.w, options.h).data);
        });
    
        gif.finish();
        console.log("RENDER END")
    }

   

    generate(pandemonium);



    function pandemonium(frame) {
        canvas = new Canvas.Canvas(250, 250);
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
}