const express = require('express');
const router = express.Router();
const { Canvas, loadImage } = require('skia-canvas')

router.get('/lunanuli.png', async (req,res)=>{
    
    let Picto = require('../../../../../bot/core/utilities/Picto')
    const canvas = Picto.new(800,600);
    const ctx = canvas.getContext('2d')
    
    let color = req.query.c;
    let img = await Picto.getCanvas(`${HOST}/build/events/hallowinter19/cooking/${color}.png`);
    ctx.drawImage(img,0,0);

    res.send(await canvas.png);
})
router.get('/selenedi.png', async (req,res)=>{

    const canvas = new Canvas(825,600);
    const ctx = canvas.getContext('2d')
    let cooktop  = "main_off"
    let cauldron = false
    let smoke    = false

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

    const X = await loadImage(HOST+"/build/events/hallowinter19/cooking/"+cooktop+".png");
    const _cauld = cauldron ? await loadImage(HOST+"/build/events/hallowinter19/cooking/"+cauldron+".png") : false;
    const _smoke = smoke ? await loadImage(HOST+"/build/events/hallowinter19/cooking/"+smoke+".png") : false;

   ctx.drawImage(X,0,0)
   if(_cauld) ctx.drawImage(_cauld,0,0); 
   if(_smoke) ctx.drawImage(_smoke,0,0);

   let i=3
   while(i--){
       if(req.query.ut){
            let utensils = req.query.ut.split(',').slice(0,3)
            
            const [u1,u2,u3] = await Promise.all([
                loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[0]||4)+".png"),
                loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[1]||4)+".png"),
                loadImage(HOST+"/build/events/hallowinter19/cooking/cauldron_0"+(utensils[2]||4)+".png")
            ]);
            
            try{ ctx.drawImage(u1,460,468, 85,85); }catch(e){}
            try{ ctx.drawImage(u2,460+90,468, 85,85); }catch(e){}
            try{ ctx.drawImage(u3,460+180,468, 85,85); }catch(e){}
           
        }
   }
    res.send(await canvas.png);
})

module.exports = router