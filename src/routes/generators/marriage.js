const Picto = require(process.env.BOT_PATH+"/core/utilities/Picto");
const express = require('express');
const router = express.Router();

 

router.get('/', async (req,res)=>{
    
	const {av1,av2,ring} = req.query;

	if ( ![av1,av2,ring].every(_=>!!_) ) return res.status(400).json("INVALID ARGS");

	const [uid1,hash1] = av1.split("::");
	const [uid2,hash2] = av2.split("::");

	const canvas = Picto.new(880,300);
	const ctx = canvas.getContext('2d');

	const [ringPic, mainframe, aviA, aviB] = await Promise.all([
		Picto.getCanvas(`https://cdn.pollux.gg/build/items/${ ring }.png`),
		Picto.getCanvas(`https://cdn.pollux.gg/build/marry/frame.png`),
		Picto.getCanvas( `https://cdn.discordapp.com/avatars/${uid1}/${hash1}.png?size=256` ),
		Picto.getCanvas( `https://cdn.discordapp.com/avatars/${uid2}/${hash2}.png?size=256` ),
	]);
		
	ctx.drawImage(aviA,50,60, 154,154 );
	ctx.drawImage(aviB,600,80, 154,154 );
	ctx.drawImage(mainframe,0,0);
	
	ctx.shadowBlur = 15;
	ctx.shadowColor = "#FEA2";

	ctx.drawImage(ringPic, 396 - (ringPic.width*1.3/2), 100 - (ringPic.height*1.3/2) ,ringPic.width*1.3,ringPic.height*1.3);

	res.status(200).header('Content-Type','image/png').send( await canvas.png );
})

module.exports = router