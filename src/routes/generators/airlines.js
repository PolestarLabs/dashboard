let Picto = require(process.env.BOT_PATH+"/core/utilities/Picto-skia")
const express = require('express');
const router = express.Router();



router.get('/generic-logo.png', async (req,res)=>{
	
	const canvas = Picto.new(128,128);
	const canvas2 = Picto.new(128,128);
	const ctx = canvas.getContext('2d');
	const ctx2 = canvas2.getContext('2d');
	
	const base = await Picto.getCanvas(HOST + "/build/airlines/generic_base.png");
	const swoosh = await Picto.getCanvas(HOST + "/build/airlines/generic_swoosh.png");

	const {name,c1,c2} = req.query;

	console.log({c1,c2})

	
	ctx.fillStyle = "#" + (c1 || "00F");
	ctx.fillRect(0,0,128,128);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.drawImage(base,0,0);

	ctx2.fillStyle = "#" + (c2 || "0FF");
	ctx2.fillRect(0,0,128,128);
	ctx2.globalCompositeOperation = 'destination-in';
	ctx2.drawImage(swoosh,0,0);

	
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(canvas2,0,0);


	ctx.fillStyle = "#" + (c2 || "FFF");
	ctx.font = "700 42px Panton"
	ctx.fillText(name || "XXXX",8,120,112);
	ctx.fillStyle = "#FFF";
	ctx.globalCompositeOperation = 'destination-over';
	ctx.fillRect(0,0,128,128);

	res.status(200).header('Content-Type','image/png').send( await canvas.png );  
})


router.get('/starting.png', async (req,res)=>{
	
	const canvas = Picto.new(700,200);
	const ctx = canvas.getContext('2d');
	
	const {IATA,id} = req.query;

	const airData = await DB.airlines.AIRPORT.get({IATA});
	const planeData = await DB.airlines.AIRPLANES.get({id});

	const base = await Picto.getCanvas(HOST + "/build/airlines/airports/"+ IATA +".jpg", HOST + "/build/airlines/airports/GENERIC.jpg");
	console.log("pre");
	const air = await Picto.getCanvas(HOST + "/build/airlines/makes/"+ planeData.make +".png");
	const plane = await Picto.getCanvas(HOST + "/build/airlines/planes/"+ planeData.id +".png");
	
	if (air.failed) console.log("FAIL");

	let calcbase =700/base.width*base.height;
	ctx.drawImage(base,0,-calcbase/4,500,  calcbase )
	ctx.blur(13);
	ctx.drawImage(air,700-200,0,200,200);
	
	
	
	ctx.font = "700 42px Panton"
	ctx.fillStyle = "#FFF";
	ctx.strokeStyle = "#123";
	ctx.shadowBlur = 5
	ctx.lineWidth = 5
	ctx.shadowColor = "#112"
	ctx.strokeText(airData.IATA ,24,120,480);
	ctx.fillText(airData.IATA ,24,120,480);
	ctx.font = "400 28px Panton"
	ctx.lineWidth = 2
	ctx.strokeText(airData.name ,34,160,480);
	ctx.fillText(airData.name ,34,160,480);
	
	ctx.drawImage(plane,0,0);
 
	res.status(200).header('Content-Type','image/png').send( await canvas.png );
})

module.exports = router