
const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{

    const UID = req.query.u;
    if (!UID) return res.status(400).json("No User ID");
    const userData = (await DB.users.get(UID)) || {
        
        modules:{
            favcolor: "#FF3355",
            bgID: "5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6",
        }
    };
    if (!userData) return res.status(404).json("No User in DB");
    
    let Picto = require(process.env.BOT_PATH+"/core/utilities/Picto");

    const canvas = Picto.new(700,300);
    //114 108
    const ctx = canvas.getContext('2d')

    let color = userData.modules.favcolor;
    let background =  await Picto.getCanvas( `${HOST}/backdrops/${userData.modules.bgID}.png` );
 

    let waves = await Picto.getCanvas(HOST + "/build/opengraph/waves.png");
    let waves_alpha = await Picto.getCanvas(HOST + "/build/opengraph/waves_alpha.png");

    let hexAvatar = await Picto.makeHex(160, (await userCache.get(UID)).avatarURL  )
    let hexFrame  = await Picto.makeHex(200, null, color )
    let hexFrame2  = await Picto.makeHex(200, null, "#A0A0C505" )

    //let tag = Picto.block(ctx, req.query.t || "I get nervous around cute furries", "12pt 'Segoe UI'", color = "#b4b4b8", W = 230, H = 36, {});
    //tag(ctx, req.query.t || "I get nervous around cute furries" ,"900 32px 'Whitney HTF'","#2b2b3b");
    
   
    
    ctx.fillStyle = color;
    
    ctx.fillRect(0,0,700,300);
    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = "#A0A0CF25";
    ctx.fillRect(0,0,700,300);
    ctx.globalAlpha = 1
    
    ctx.globalCompositeOperation = "multiply"
    ctx.drawImage(waves ,0 ,0);


    ctx.globalCompositeOperation = "destination-atop"
    ctx.drawImage(waves ,0 ,0,700,300);

    ctx.globalCompositeOperation = "source-over";

  

    ctx.globalCompositeOperation = "destination-over";
    let gradient = ctx.createLinearGradient(0, 300, 0, 0);
    gradient.addColorStop(.3, "#0A0A0FAD");
    gradient.addColorStop(1, "#1122");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,700,300);
    ctx.drawImage(background ,-10 ,-40,720,380);

    ctx.globalCompositeOperation = "source-over";
    

    ctx.drawImage(hexFrame,28 ,70); 
    ctx.drawImage(hexFrame2,28 ,70);
    ctx.drawImage(hexAvatar,28+20 ,70+20);

    //ctx.drawImage(tag.item ,110 ,102);

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router