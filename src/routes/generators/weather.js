const Picto = require('../../../../bot/core/utilities/Picto');
const express = require('express');
const router = express.Router();

const WeatherCache = new Map();

 
const ASSETS = {
    //BASE
    frame: '/build/weather/frame.png'
    ,miniframe1: '/build/weather/miniframe1.png'
    ,template: '/build/weather/template.png'
    //POLLUXES
    ,plx_kinda_hot: '/build/weather/polluxes/kinda_hot.png'
    //SKYLINES
    ,sky_clear: '/:build/weather/skylines/clear.png'
    ,sky_cloudy: '/build/weather/skylines/cloudy.png'
    ,sky_droplets: '/build/weather/skylines/droplets.png'
    ,sky_flake: '/build/weather/skylines/flake.png'
    ,sky_fog: '/build/weather/skylines/fog.png'
    ,sky_snow:'/build/weather/skylines/heavy snow.png'
    ,sky_lightrain: '/build/weather/skylines/lightrain.png'
    ,sky_cloudy:'/build/weather/skylines/night cloudy.png'
    ,sky_overcast: '/build/weather/skylines/overcast.png'
    ,sky_showers :'/build/weather/skylines/showers.png'
    ,sky_showers:'/build/weather/skylines/snow showers.png'
    ,sky_snow: '/build/weather/skylines/snow.png'
    ,sky_storm :'/build/weather/skylines/storm.png'
    ,sky_sunny: '/build/weather/skylines/sunny.png'
    ,sky_thundersnow :'/build/weather/skylines/thundersnow.png'
    ,sky_Thunderstorms :'/build/weather/skylines/Thunderstorms.png'
    ,sky_tornado: '/build/weather/skylines/tornado.png'
    ,sky_wind: '/build/weather/skylines/wind.png'
    //problematic ones
    ,"partly cloudy with rain": '/build/weather/skylines/partly cloudy with rain.png'
    ,"night partly cloudy with rain": '/build/weather/skylines/night partly cloudy with rain.png'
    
}

const STROKE_COLOR = "2b2b3C";

Object.keys(ASSETS).forEach(item=> WeatherCache.set(item, Picto.getCanvas(HOST + ASSETS[item] ) ));

function inoffensivePolygon(stroke,fill){
    const canvas = Picto.new(160,100);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = fill || "red";
    ctx.strokeStyle = stroke || "blue";
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(15, 7);
    ctx.lineTo(139, 7);
    ctx.lineTo(140, 68);
    ctx.lineTo(8,52);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    return canvas;
}

function createMinicard(temp,unit,day,icon){
    const canvas = Picto.new(155,100);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inoffensivePolygon(STROKE_COLOR,STROKE_COLOR),10,20);
    ctx.drawImage(inoffensivePolygon(STROKE_COLOR),0,0);

    return canvas;
    
}

router.get('/', async (req,res)=>{
    


    const canvas = Picto.new(800,600);
    const ctx = canvas.getContext('2d');

    let _TEMPLATE = await WeatherCache.get('template');

    ctx.drawImage(_TEMPLATE,0,0);
    
    ctx.drawImage(createMinicard(),110,110);


   

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router