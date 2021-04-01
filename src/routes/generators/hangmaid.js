const Picto = require(process.env.BOT_PATH+"/core/utilities/Picto");
const express = require('express');
const router = express.Router();

let PARTS = Promise.all([
    Picto.getCanvas(HOST + '/build/games/hangmaid/arm-l.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/arm-r.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/leg-l.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/leg-r.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/head.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/body.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/noose.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/scratches.png'),
    Picto.getCanvas(HOST + '/build/games/hangmaid/base.png'),
]).then(res=> {
    PARTS = {
        armL: res[0],
        armR: res[1],
        legL: res[2],
        legR: res[3],
        head: res[4],
        body: res[5],
        noose:res[6],
        red:  res[7],
        base: res[8],
        _loaded: true
    }
});

router.get('/', async (req,res)=>{

    if(!PARTS.loaded) await PARTS;

    const userID = req.query.uid


    const canvas = Picto.new(795,415);
    const ctx = canvas.getContext('2d');

    const polly = Picto.new(500,666);
    const _ply = polly.getContext('2d');

    //ctx.setTransform(1,.05, 0, 1, 0, 0);
    ctx.rotate(-0.0999);
    ctx.translate(-75, -55);

    let {a:attempts,g:guesses,e:ended,h:hint} = req.query;

    attempts = attempts || "";
    guesses = guesses?.split('') || ['_','_','_','_','_'];


    if(attempts.length >= 3 ) _ply.drawImage(PARTS.legR,0,0);
    if(attempts.length >= 5 ) _ply.drawImage(PARTS.legL,0,0);
    if(attempts.length >= 4 ) _ply.drawImage(PARTS.armR,0,0);
    if(attempts.length >= 2 ) _ply.drawImage(PARTS.armL,0,0);
    if(attempts.length >= 1 ) _ply.drawImage(PARTS.body,0,0);
    _ply.drawImage(PARTS.noose,0,0);
    if(attempts.length >= 6 ) _ply.drawImage(PARTS.head,0,0);


    ctx.drawImage(PARTS.base,0,0);
    ctx.globalAlpha = 0.45
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(polly,75,100,205,271);
    ctx.drawImage(polly,75,100,205,271);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    const gx = 450,
          gy = 395,
          ax = 795,
          ay = 260;

    ctx.save();
    ctx.translate( -(-50+(guesses.length||1) * 42)/2 ,0);

    ctx.globalAlpha = 0.9

    guesses.forEach((letter,i)=>{
        let underscore = Picto.tag(ctx,'_','50pt "Coming Home", Pangolin','#1b52c3' ).item;
        let glyph = Picto.tag(ctx,letter == '_' ? ' ': letter,'48pt "Coming Home", Pangolin','#1b52c3' ).item;

        ctx.drawImage(
            underscore,
            gx + (i*42)  - underscore.width / 2,
            gy
            );
            ctx.drawImage(
                glyph,
                gx + (i*42)  - glyph.width / 2,
                gy - 10
            );
    });

    ctx.restore();

    let attempts_text = Picto.tag(ctx,attempts.split('').join('-'),'40pt "Coming Home", Pangolin','#c40e0e' ).item;
    let hint_text = Picto.tag(ctx,`(${hint})`,'20pt "Coming Home", Pangolin','#1b52c3' ).item;

    ctx.drawImage(attempts_text,ax-attempts_text.width,ay);
    ctx.drawImage(hint_text,ax-hint_text.width,ay-50);


    //ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = .85;
    //if(ended === 'win') ctx.drawImage(PARTS.green,0,0);
    if(ended === 'lose') ctx.drawImage(PARTS.red,0,-10);


    res.writeHead(200, {'Content-Type': 'image/png'});
    canvas.pngStream({ compressionLevel: 2, filters: 0 }).pipe(res);
})


module.exports = router
