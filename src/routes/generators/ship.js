const Picto = require('../../../../bot/core/utilities/Picto');
const express = require('express');
const router = express.Router();

 

router.get('/', async (req,res)=>{
    
    const {av1,av2,spn,pct} = req.query;

    if ( ![av1,av2,spn,pct].every(_=>!!_) ) return res.status(400).json("INVALID ARGS");

    const [uid1,hash1] = av1.split("::");
    const [uid2,hash2] = av2.split("::");

    const canvas = Picto.new(796,445);
    const ctx = canvas.getContext('2d');

    const [randPic, mainframe, aviA, aviB] = await Promise.all([
        Picto.getCanvas(`https://cdn.pollux.gg/build/ship/${Math.round(pct / 10)}.png`),
        Picto.getCanvas(`https://cdn.pollux.gg/build/ship/mainframe.png`),
        Picto.getCanvas( `https://cdn.discordapp.com/avatars/${uid1}/${hash1}.png?size=256` ),
        Picto.getCanvas( `https://cdn.discordapp.com/avatars/${uid2}/${hash2}.png?size=256` ),
      ]);
  
      ctx.fillStyle = "#ffdeaa";
      ctx.fillRect(87, 105, 630, 190);
      ctx.drawImage(aviA, 87 - 10, 95, 200, 200);
      ctx.drawImage(aviB, 522 - 10, 95, 200, 200);
      ctx.drawImage(randPic, 287, 17);
    
      ctx.drawImage(mainframe, 0, 0);
    
      Picto.setAndDraw(
        ctx, Picto.tag(
          ctx,
          `❤  ${spn}  ❤`, // "Lorem Ipsum dolor sit amet concectetur adipiscing elit ",
          "600 35px 'Panton'",
          "#FFF",
        ),
        400, 318, 540, "center",
      );
    
      ctx.translate(300, 80);
      ctx.rotate(-0.195);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(30,30,80,.2)";
      const mainW = Picto.popOutTxt(
        ctx, pct.toString().padStart(3, " "), 0, 0, "80px 'Corporate Logo Rounded'",
        "#fff", null, { style: "#f69", line: 20 }, -1,
      ).w;
      ctx.rotate(0.195 - 0.05);
      Picto.popOutTxt(ctx, "%", mainW - 30, 15, "44px 'Corporate Logo Rounded'", "#fff", null, { style: "#f69", line: 15 }, -1);
      ctx.rotate(0.05);
      ctx.translate(-300, -80);


    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router