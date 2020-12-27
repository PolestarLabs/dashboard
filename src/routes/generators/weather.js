const Picto = require('../../../../bot/core/utilities/Picto');
const express = require('express');
const router = express.Router();

const YAHOO_CODES = [
  
  "tornado",
"tornado",
"tornado",
"Thunderstorms",
"Thunderstorms",
"snow",
"snow",
"snow",
"snow",
"lightrain",
"snow",
"showers",
"showers",
"storm",
"snow",
"storm",
"snow",
"heavy snow",
"snow",
"wind",
"fog",
"fog",
"fog",
"wind",
"wind",
"flake",
"cloudy",
"night cloudy",
"cloudy",
"night cloudy",
"overcast",
"clear",
"sunny",
"clear",
"sunny",
"snow showers",
"sunny",
"Thunderstorms",
"Thunderstorms",
"Thunderstorms",
"partly cloudy with rain",
"thundersnow",
"snow",
"thundersnow",
"overcast",
"thunderstorms",
"snow",
"thunderstorms",
"droplets"  
]
  

const WeatherCache = new Map();

 
const ASSETS = {
    //BASE
    //frame: '/build/weather/frame.png'    
    template: '/build/weather/template.png'
    //POLLUXES
    ,plx_kinda_hot: '/build/weather/polluxes/kinda_hot.png'
    //SKYLINES
    ,sky_clear: '/build/weather/skylines/clear.png'
    ,sky_cloudy: '/build/weather/skylines/cloudy.png'
    ,sky_droplets: '/build/weather/skylines/droplets.png'
    ,sky_flake: '/build/weather/skylines/flake.png'
    ,sky_fog: '/build/weather/skylines/fog.png'
    ,sky_snow:'/build/weather/skylines/heavy snow.png'
    ,sky_lightrain: '/build/weather/skylines/lightrain.png'
    ,sky_cloudy:'/build/weather/skylines/night cloudy.png'
    ,sky_overcast: '/build/weather/skylines/overcast.png'
    ,sky_showers :'/build/weather/skylines/showers.png'
    ,sky_snow_showers:'/build/weather/skylines/snow showers.png'
    ,sky_snow: '/build/weather/skylines/snow.png'
    ,sky_storm :'/build/weather/skylines/storm.png'
    ,sky_sunny: '/build/weather/skylines/sunny.png'
    ,sky_thundersnow :'/build/weather/skylines/thundersnow.png'
    ,sky_Thunderstorms :'/build/weather/skylines/Thunderstorms.png'
    ,sky_tornado: '/build/weather/skylines/tornado.png'
    ,sky_wind: '/build/weather/skylines/wind.png'
    
    //BACKDROPS
    ,bg_deepskyblue: '/build/weather/bg_deepskyblue.png'
    ,bg_dusk: '/build/weather/bg_dusk.png'
    ,bg_midnight: '/build/weather/bg_midnight.png'
    ,bg_palelune: '/build/weather/bg_palelune.png'
    ,bg_violettwilight: '/build/weather/bg_violettwilight.png'
    ,bg_winternoon: '/build/weather/bg_winternoon.png'

    // ICONS
    ,clear: '/build/weather/icons_new/clear.png'
    ,cloudy: '/build/weather/icons_new/cloudy.png'
    ,droplets: '/build/weather/icons_new/droplets.png'
    ,frost: '/build/weather/icons_new/frost.png'
    ,'heavy snow': '/build/weather/icons_new/heavy snow.png'
    ,'night cloudy': '/build/weather/icons_new/night cloudy.png'
    ,'night partly cloudy with rain': '/build/weather/icons_new/night partly cloudy with rain.png'
    ,overcast: '/build/weather/icons_new/overcast.png'
    ,'partly cloudy with rain': '/build/weather/icons_new/partly cloudy with rain.png'
    ,rain: '/build/weather/icons_new/rain.png'
    ,showers: '/build/weather/icons_new/showers.png'
    ,'snow showers': '/build/weather/icons_new/snow showers.png'
    ,snow: '/build/weather/icons_new/snow.png'
    ,storm: '/build/weather/icons_new/storm.png'
    ,sunny: '/build/weather/icons_new/sunny.png'
    ,thundersnow: '/build/weather/icons_new/thundersnow.png'
    ,Thunderstorms: '/build/weather/icons_new/thunderstorms.png'
    ,tornado: '/build/weather/icons_new/tornado.png'
    ,wind: '/build/weather/icons_new/wind.png'
   
   
    //problematic ones
    ,"partly cloudy with rain": '/build/weather/skylines/partly cloudy with rain.png'
    ,"night partly cloudy with rain": '/build/weather/skylines/night partly cloudy with rain.png'
    
}

const STROKE_COLOR = "#1b1c25";

Object.keys(ASSETS).forEach(item=> WeatherCache.set(item, Picto.getCanvas(HOST + ASSETS[item] ) ));

function inoffensivePolygon(stroke,fill,round){
    const canvas = Picto.new(160,100);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = fill || "red";
    ctx.strokeStyle = stroke || "blue";
    if (round) ctx.lineJoin = "round";
    
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
function aggressivePolygon(stroke,fill,round,bkg){
    const canvas = Picto.new(450,155);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = fill || "red";
    ctx.strokeStyle = stroke || "blue";
    if (round) ctx.lineJoin = "round";

    ctx.lineWidth = 8;
    ctx.translate(10,0)
    ctx.beginPath();
    ctx.moveTo(13, 11);
    ctx.lineTo(414, 11);
    ctx.lineTo(425, 109);
    ctx.lineTo(5,85);
    ctx.closePath();
    ctx.fill();
    if(bkg){
        console.log({bkg})
        ctx.save();
        ctx.clip();
        ctx.drawImage(bkg, 425-288, 0,288,144);
        ctx.closePath();
        ctx.restore();
    }
    
    ctx.stroke();
    return canvas;
}
function createMinicard(temp,unit,day,icon){
    const canvas = Picto.new(155,100);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inoffensivePolygon(STROKE_COLOR,STROKE_COLOR),10,20);
    ctx.drawImage(inoffensivePolygon(STROKE_COLOR, "#3347c0"),0,0);

    let TEMP = Picto.tag(ctx,parseInt(temp) + "°","italic 900 30pt 'Panton Black' ",'white').item;
    let DAY = Picto.tag(ctx,day ,"900 16pt 'AvenirNextRoundedW01-Bold' ",'#EEEFFFAF').item;

    ctx.drawImage( TEMP, 15, 12 );
    ctx.rotate( 0.08235987755982988 );
    ctx.drawImage( DAY, 23, 52 );
    ctx.drawImage( icon, 90, 0 ,50,50);


    return canvas;
    
}
function createCountryTag(city,country,flag,bkg,time){
    const canvas = Picto.new(480,155);
    const ctx = canvas.getContext('2d');
    ctx.drawImage( aggressivePolygon(STROKE_COLOR,STROKE_COLOR) , 20,15);
    ctx.drawImage( aggressivePolygon(STROKE_COLOR,STROKE_COLOR,1,bkg) , 0,0);
    
    
    let COUNTRY = Picto.tag(ctx,country.toUpperCase() ,"900 14pt 'AvenirNextRoundedW01-Regular' ",'#DEDEF0',{style: STROKE_COLOR, line: 8}).item;
    let CITY = Picto.tag(ctx,city ,"900 28pt 'AvenirNextRoundedW01-Bold' ",'#FFF',{style: STROKE_COLOR, line: 10}).item;
    let CITY_SHADOW = Picto.tag(ctx,city ,"900 28pt 'AvenirNextRoundedW01-Bold' ",STROKE_COLOR,{style: STROKE_COLOR, line: 10}).item;
    
    ctx.rotate( 0.02235987755982988 );
    ctx.drawImage(  flag , 30,8,80,80);
    ctx.rotate( -0.02235987755982988*1.2 );
    ctx.drawImage( CITY_SHADOW, 113+5, 8+5, Math.min(CITY.width, 310), CITY.height) ;
    ctx.drawImage( CITY, 113, 8, Math.min(CITY.width, 310), CITY.height) ;
    ctx.rotate( 0.02235987755982988*1.8 );
    ctx.drawImage( COUNTRY, 123, 55, Math.min(COUNTRY.width, 310), 25) ;


    return canvas;
}

router.get('/', async (req,res)=>{
    
    if (!req.query.furball) return res.status(400).json("The cat is missing");
    
    let payload;
    try{
        payload = JSON.parse(new Buffer( req.query.furball , 'base64').toString('utf-8'));
    }catch(err){
        return res.status(400).json("This is not my cat!");        
    }

    
    const canvas = Picto.new(800,600);
    const ctx = canvas.getContext('2d');
console.log(payload)
    const ISO = payload.country.iso.toLowerCase();

    //let _TEMPLATE = await WeatherCache.get('template');
    let _FLAG     = await Picto.getCanvas(HOST + `/build/guessing/guessflags/${ payload.country.name.toLowerCase().replace(/ +/,"-") }.png`);
    let _PREPLX     = await Picto.getCanvas(HOST + `/build/weather/precomps/${ "kinda_hot_deep" }.png`);
    let _BKG     = await Picto.getCanvas(HOST + `/build/weather/skylines/${  YAHOO_CODES[payload.code] || 'clear'}.png`);
    let _POLY     = await WeatherCache.get('plx_kinda_hot');
    let _MAP      = await Picto.getCanvas(HOST + `/build/world/${ISO.toLowerCase()}/512.png`);
    let _ICON     = await WeatherCache.get( YAHOO_CODES[payload.code] );
    let _MINI1     = await WeatherCache.get( YAHOO_CODES[payload.week[0].code] );
    let _MINI2     = await WeatherCache.get( YAHOO_CODES[payload.week[1].code]  );
    let _MINI3     = await WeatherCache.get( YAHOO_CODES[payload.week[2].code]  );
    let _BACKDROP = await WeatherCache.get('bg_deepskyblue');
    console.log(YAHOO_CODES[payload.code] )
    console.table({_MINI1,_MINI2,_MINI3})

    /*
        droplets_purple.png
        kinda_hot_bright.png
        kinda_hot_deep.png
        kinda_hot_dusk.png
        light_rain_day.png
        light_rain_dusk.png
        light_rain_night.png
    */

    //ctx.drawImage(_TEMPLATE,0,0);
    //ctx.drawImage(_BACKDROP,0,0);
    ctx.drawImage(_PREPLX,0,0);
    
    ctx.save();
    ctx.globalAlpha =.4
    ctx.globalCompositeOperation = 'overlay'
    ctx.drawImage( _MAP,  325,105,350,350);
    ctx.restore();
    ctx.save();
    
    
    ctx.translate(610,170)
    ctx.rotate( -.19235987755982988 );
    let avgTemp1 = ((payload.week[0].high||0) + (payload.week[0].low||0)) / 2;
    ctx.drawImage(createMinicard( avgTemp1,"C", payload.week[0].day.slice(0,3),_MINI1 ),0,0);
    
    ctx.translate( 10,85);
    ctx.rotate( .19235987755982988 );
    let avgTemp2 = ((payload.week[1].high||0) + (payload.week[1].low||0)) / 2;
    ctx.drawImage(createMinicard( avgTemp2,"C", payload.week[1].day.slice(0,3),_MINI2 ),0,0);
    
    ctx.translate( 10,85);
    ctx.rotate( .19235987755982988 );
    let avgTemp3 = ((payload.week[2].high||0) + (payload.week[2].low||0)) / 2;
    ctx.drawImage(createMinicard( avgTemp3,"C", payload.week[2].day.slice(0,3),_MINI3 ),0,0);
    
    ctx.restore();
    
    ctx.rotate( -.05835987755982988 );
    ctx.drawImage(createCountryTag( payload.city,payload.country.name,_FLAG,_BKG,"4:15 AM"),-40,490);
    ctx.restore();
    
    const tempNow = payload.curr || payload.temp || 0;

    let TEMP = Picto.tag(ctx,tempNow ,"italic 900 120pt 'Panton Black' ",'#FFF',{style: STROKE_COLOR, line: 25}).item;
    let TEMP_SHADOW = Picto.tag(ctx,tempNow ,"italic 900 120pt 'Panton Black' ",STROKE_COLOR,{style: STROKE_COLOR, line: 25}).item;
    
    ctx.drawImage( TEMP_SHADOW, 680+10 -TEMP.width ,470+10);
    ctx.drawImage( TEMP,        680 -TEMP.width ,470);
    
    TEMP = Picto.tag(ctx,"°C" ,"italic 900 62pt 'Panton Black' ",'#FFF',{style: STROKE_COLOR, line: 25}).item;
    TEMP_SHADOW = Picto.tag(ctx,"°C" ,"italic 900 62pt 'Panton Black' ",STROKE_COLOR,{style: STROKE_COLOR, line: 25}).item;
    
    ctx.drawImage( TEMP_SHADOW, 620+10 ,530+10);
    ctx.drawImage( TEMP,        620 ,530);
    
    console.log(YAHOO_CODES[payload.code])
    ctx.drawImage( _ICON,  600,35,180,180);

    

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router


