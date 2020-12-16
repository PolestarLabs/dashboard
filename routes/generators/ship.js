const Picto = require('../../../bot/core/utilities/Picto');
const express = require('express');
const router = express.Router();

 

router.get('/', async (req,res)=>{
    
 
    TargetA = 
    TargetB = 

    const canvas = Picto.new(796,445);
    const ctx = canvas.getContext('2d');

    const [randPic, mainframe, aviA, aviB] = await Promise.all([
        Picto.getCanvas(`${paths.CDN}/build/ship/${Math.round(rand / 10)}.png`),
        Picto.getCanvas(`${paths.CDN}/build/ship/mainframe.png`),
        Picto.getCanvas(TargetA.avatarURL),
        Picto.getCanvas(TargetB.avatarURL),
      ]);
 
  
    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router