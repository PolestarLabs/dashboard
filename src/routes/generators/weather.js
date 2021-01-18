const Picto = require(process.env.BOT_PATH+"/core/utilities/Picto");
const express = require('express');
const router = express.Router();



const GFX_TABLE =[
    {   "code": 0,   "condition": "tornado",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 3,   "shade_night": 2,   "icon": 9 },
    {   "code": 1,   "condition": "tropical storm",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 3,   "shade_night": 2,   "icon": 9 },
    {   "code": 2,   "condition": "hurricane",   "sky": "night_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 2,   "shade_night": 2,   "icon": 9 },
    {   "code": 3,   "condition": "severe thunderstorms",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 3,   "shade_night": 2,   "icon": 8 },
    {   "code": 4,   "condition": "thunderstorms",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 3,   "shade_night": 2,   "icon": 8 },
    {   "code": 5,   "condition": "mixed rain and snow",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 3,   "shade_night": 2,   "icon": 22 },
    {   "code": 6,   "condition": "mixed rain and sleet",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 3,   "shade_night": 2,   "icon": 22 },
    {   "code": 7,   "condition": "mixed snow and sleet",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 3,   "shade_night": 2,   "icon": 22 },
    {   "code": 8,   "condition": "freezing drizzle",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "light_rain",   "shade_day": 3,   "shade_night": 2,   "icon": 12 },
    {   "code": 9,   "condition": "drizzle",   "sky": "blue_rain",   "sky_night": "night_rain",   "sky6": "twilight_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 1,   "shade6": 4,   "icon": 3 },
    {   "code": 10,   "condition": "freezing rain",   "sky": "lilac_rain",   "sky_night": "night_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 13 },
    {   "code": 11,   "condition": "showers",   "sky": "blue_rain",   "sky_night": "night_rain",   "sky6": "twilight_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 2,   "shade6": 4,   "icon": 16 },
    {   "code": 12,   "condition": "rain",   "sky": "overcast_rain",   "sky_night": "night_rain",   "sky6": "twilight_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 2,   "shade6": 4,   "icon": 14 },
    {   "code": 13,   "condition": "snow flurries",   "sky": "blue_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 11 },
    {   "code": 14,   "condition": "light snow showers",   "sky": "blue_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 12 },
    {   "code": 15,   "condition": "blowing snow",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 5 },
    {   "code": 16,   "condition": "snow",   "sky": "blue_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 11 },
    {   "code": 17,   "condition": "hail",   "sky": "overcast_snow",   "sky_night": "night_snow",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 7 },
    {   "code": 18,   "condition": "sleet",   "sky": "blue_snow",   "sky_night": "night_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 4 },
    {   "code": 19,   "condition": "dust",   "sky": "dusk",   "sky_night": "night",   "sky6": "dusk",   "pollux": "heavy_rain",   "shade_day": 1,   "shade_night": 2,   "icon": 10 },
    {   "code": 20,   "condition": "foggy",   "sky": "lilac_foggy",   "sky_night": "night_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 0,   "icon": 17 },
    {   "code": 21,   "condition": "haze",   "sky": "lilac_foggy",   "sky_night": "night_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 0,   "icon": 17 },
    {   "code": 22,   "condition": "smoky",   "sky": "lilac_foggy",   "sky_night": "night_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 0,   "icon": 17 },
    {   "code": 23,   "condition": "blustery",   "sky": "lilac_foggy",   "sky_night": "night_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 0,   "icon": 17 },
    {   "code": 24,   "condition": "windy",   "sky": "overcast_clouds",   "sky_night": "night_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 0,   "icon": 10 },
    {   "code": 25,   "condition": "cold",   "sky": "blue",   "sky_night": "night",   "pollux": "cold",   "shade_day": 0,   "shade_night": 2,   "icon": 4 },
    {   "code": 26,   "condition": "cloudy",   "sky": "overcast_clouds",   "sky_night": "night_clouds",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 15 },
    {   "code": 27,   "condition": "mostly cloudy (night)",   "sky": "lilac_foggy",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 21 },
    {   "code": 28,   "condition": "mostly cloudy (day)",   "sky": "overcast_clouds",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 15 },
    {   "code": 29,   "condition": "partly cloudy (night)",   "sky": "night_clouds",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 21 },
    {   "code": 30,   "condition": "partly cloudy (day)",   "sky": "cyan_clouds",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 15 },
    {   "code": 31,   "condition": "clear (night)",   "sky": "night",   "sky6": "dusk_clouds",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 2 },
    {   "code": 32,   "condition": "sunny",   "sky": "cyan",   "sky_night": "night",   "sky6": "dusk",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "shade6": 1,   "icon": 6 },
    {   "code": 33,   "condition": "fair (night)",   "sky": "lilac",   "sky_night": "night",   "sky6": "dusk",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "shade6": 1,   "icon": 21 },
    {   "code": 34,   "condition": "fair (day)",   "sky": "blue",   "sky_night": "night",   "sky6": "dusk",   "pollux": "default",   "shade_day": 0,   "shade_night": 2,   "icon": 15 },
    {   "code": 35,   "condition": "mixed rain and hail",   "sky": "overcast_rain",   "sky_night": "night_rain",   "sky6": "twilight_rain",   "pollux": "rain",   "shade_day": 0,   "shade_night": 2,   "shade6": 4,   "icon": 7 },
    {   "code": 36,   "condition": "hot",   "sky": "cyan",   "sky_night": "night",   "sky6": "dusk_sun",   "pollux": "hot",   "shade_day": 0,   "shade_night": 2,   "shade6": 4,   "icon": 6 },
    {   "code": 37,   "condition": "isolated thunderstorms",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "rain",   "shade_day": 0,   "shade_night": 2,   "icon": 8 },
    {   "code": 38,   "condition": "scattered thunderstorms",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 8 },
    {   "code": 39,   "condition": "scattered showers (day)",   "sky": "blue_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 16 },
    {   "code": 40,   "condition": "heavy rain",   "sky": "overcast_rain",   "sky_night": "night_rain",   "sky6": "twilight_rain",   "pollux": "rain",   "shade_day": 0,   "shade_night": 2,   "shade6": 4,   "icon": 14 },
    {   "code": 41,   "condition": "scattered snow showers (day)",   "sky": "blue_rain",   "sky6": "twilight_rain",   "pollux": "light_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 22 },
    {   "code": 42,   "condition": "heavy snow",   "sky": "overcast_snow",   "pollux": "snow",   "shade_day": 0,   "shade_night": 2,   "icon": 22 },
    {   "code": 43,   "condition": "blizzard",   "sky": "overcast_snow",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 5 },
    {   "code": 44,   "condition": "not available",   "sky": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 5 },
    {   "code": 45,   "condition": "scattered showers (night)",   "sky": "night_rain",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 20 },
    {   "code": 46,   "condition": "scattered snow showers (night)",   "sky": "night_snow",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 12 },
    {   "code": 47,   "condition": "scattered thundershowers",   "sky": "overcast_thunder",   "sky_night": "night_thunder",   "pollux": "heavy_rain",   "shade_day": 0,   "shade_night": 2,   "icon": 8 }
   ];








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
  
const STROKE_COLOR = "#1b1c25";
const DEFAULT_POLLUX = "kinda_hot";
const DEFAULT_SKY = "blue";

function inoffensivePolygon(stroke,fill,round){
    const canvas = Picto.new(320,200);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = fill || "red";
    ctx.strokeStyle = stroke || "blue";
    if (round) ctx.lineJoin = "round";
    
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(15*2, 7);
    ctx.lineTo(139*2, 7);
    ctx.lineTo(140*2, 68*2);
    ctx.lineTo(8*2,52*2);
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
        ctx.globalAlpha = .5
        console.log({bkg})
        ctx.save();
        ctx.clip();
        ctx.drawImage(bkg, 425-288, 0,288,144);
        ctx.closePath();
        ctx.restore();
        ctx.globalAlpha = 1
    }
    
    ctx.stroke();
    return canvas;
}
function createMinicard(temp,unit="C",day,icon){
    const canvas = Picto.new(310,200);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inoffensivePolygon(STROKE_COLOR,STROKE_COLOR),20,40);
    ctx.drawImage(inoffensivePolygon(STROKE_COLOR, "#3347c0"),0,0);

    let TEMP_MAX = Picto.tag(ctx,  parseInt(temp[0]||0) + "° △","italic 900 36pt 'Panton Black' ",'white').item;
    let TEMP_MIN = Picto.tag(ctx,  parseInt(temp[1]||0) + "° ▽","italic 900 36pt 'Panton Black' ",'white').item;
    let DAY = Picto.tag(ctx,day ,"900 28pt 'AvenirNextRoundedW01-Bold' ",'#EEEFFFAF').item;

    ctx.drawImage( TEMP_MAX, 177-TEMP_MAX.width, 16 );
    ctx.drawImage( TEMP_MIN, 170-TEMP_MIN.width, 8+TEMP_MAX.height );
    ctx.rotate( 0.08235987755982988 );
    ctx.drawImage( DAY, 46, 109 );
    ctx.drawImage( icon, 180, 0 ,100,100);


    return canvas;
    
}
function createCountryTag(city,country,flag,bkg,time="12:59 PM"){
    const canvas = Picto.new(480,155);
    const ctx = canvas.getContext('2d');
    ctx.drawImage( aggressivePolygon(STROKE_COLOR,STROKE_COLOR) , 20,15);
    ctx.drawImage( aggressivePolygon(STROKE_COLOR,STROKE_COLOR,1,bkg) , 0,0);
    
    
    let COUNTRY = Picto.tag(ctx,country.toUpperCase() ,"900 14pt 'AvenirNextRoundedW01-Regular' ",'#DEDEF0',{style: STROKE_COLOR, line: 8}).item;
    let TIME = Picto.tag(ctx, time ,"900 14pt 'AvenirNextRoundedW01-Regular' ",'#DEDEF0',{style: STROKE_COLOR, line: 8}).item;
    let CITY = Picto.tag(ctx,city ,"900 28pt 'AvenirNextRoundedW01-Bold' ",'#FFF',{style: STROKE_COLOR, line: 10}).item;
    let CITY_SHADOW = Picto.tag(ctx,city ,"900 28pt 'AvenirNextRoundedW01-Bold' ",STROKE_COLOR,{style: STROKE_COLOR, line: 10}).item;
    
    ctx.rotate( 0.02235987755982988 );
    ctx.drawImage(  flag , 30,8,80,80);
    ctx.rotate( -0.02235987755982988*1.2 );
    ctx.drawImage( CITY_SHADOW, 113+5, 8+5, Math.min(CITY.width, 310), CITY.height) ;
    ctx.drawImage( CITY, 113, 8, Math.min(CITY.width, 310), CITY.height) ;
    ctx.rotate( 0.02235987755982988*1.8 );
    ctx.drawImage( COUNTRY, 123, 55, Math.min(COUNTRY.width, 310), 25) ;
    Picto.roundRect(ctx,350,65,90,30,15,STROKE_COLOR)
    ctx.drawImage( TIME, 352, 68,TIME.width,24) ;


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
    

    const CONDITION = GFX_TABLE.find( c => c.code === payload.code );

    if (!CONDITION) CONDITION =  {
        condition: "sunny",
        sky: "cyan",
        sky_night: "night",
        pollux: "default",
        shade_day: 0,
        shade_night: 2,
        shade6: 1
    };



    
    
    const ISO = payload.country.iso?.toLowerCase();
    const COUNTRY = payload.country.name;
    const COUNTRY_FLAG = payload.flag_override || COUNTRY.toLowerCase().replace(/ +/,"-");
    const LOCAL_TIME = new Date().toLocaleTimeString(Date.now(), {hour: '2-digit', minute: '2-digit', timeZone: payload.timezone_id });
    const TEMPERATURE = payload.curr || payload.temp || 0;
    const T_UNIT = payload.unit || "C"
    
   

    const localTimeParsed = new Date( "1/1/2020 " + LOCAL_TIME);
    const sunsetParsed = new Date( "1/1/2020 " + payload.sunset);
    const sunriseParsed = new Date( "1/1/2020 " + payload.sunrise);
    const beforeSunset   = sunsetParsed > localTimeParsed; 
    const pastSunrise  = new Date( "1/1/2020 " + payload.sunrise) < localTimeParsed;
    const duskInterval = [new Date( new Date(sunsetParsed).setHours(sunsetParsed.getHours() - 1)), new Date(new Date(sunsetParsed).setHours(sunsetParsed.getHours() + 1))];
    
    const isNight = !beforeSunset || !pastSunrise;
    const isDusk  = localTimeParsed > duskInterval[0] && localTimeParsed < duskInterval[1];

    console.log({
        LOCAL_TIME,
        localTimeParsed,
sunsetParsed,
sunriseParsed,
beforeSunset,
pastSunrise,
duskInterval,
isNight,
isDusk,
 
    })
    
    const SKY = isDusk 
        ? CONDITION.sky6 || CONDITION.sky
        : isNight
            ? CONDITION.sky_night || CONDITION.sky
            : CONDITION.sky || DEFAULT_SKY;

    let SHADE = isDusk 
        ? CONDITION.shade6 || CONDITION.shade_day
        : isNight
            ? CONDITION.shade_night || CONDITION.shade_day
            : CONDITION.shade_day || 0;
    
    let W_POLLUX = CONDITION.pollux;
    // TODO: Add temperature variation;

    // CONDITION OVERRIDES
        if (TEMPERATURE < 5 && W_POLLUX != "snow"){
            W_POLLUX = 'cold';
            if (isDusk) SHADE = 4;
        }
    
    const canvas = Picto.new(800,600);
    const ctx = canvas.getContext('2d');

    const easterEgg = {};

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    if( payload.region === " RS" && payload.country.name === "Brazil" ){
        easterEgg.flag = "/build/guessing/guessflags/riograndense-republic.png"
        payload.country.name = "Riograndense Republic"
        easterEgg.map = "/build/weather/eggs/provincia.png"
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    
    const [_MAP, _FLAG, _SKY, _POLY, _ICON, _MINI1, _MINI2, _MINI3, _SKYLINE] = await Promise.all([
         Picto.getCanvas(HOST + ( easterEgg.map || payload.map_override || `/build/world/${ISO}/512.png`) )
        ,Picto.getCanvas(HOST + ( easterEgg.flag || `/build/guessing/guessflags/${ COUNTRY_FLAG }.png`) )
        ,Picto.getCanvas(HOST + ( easterEgg.sky || `/build/weather/backdrops/${  SKY  }.png`) )
        ,Picto.getCanvas(HOST + ( easterEgg.pollux || `/build/weather/polluxes/${ W_POLLUX }-${ SHADE }.png`) )
        ,Picto.getCanvas(HOST + ( easterEgg.condition || `/build/weather/icons_new/${ CONDITION.icon }.png`) )
        ,Picto.getCanvas(HOST + `/build/weather/icons_new/${ GFX_TABLE.find(c=>c.code === payload.week[0].code).icon }.png`)
        ,Picto.getCanvas(HOST + `/build/weather/icons_new/${ GFX_TABLE.find(c=>c.code === payload.week[1].code).icon }.png`)
        ,Picto.getCanvas(HOST + `/build/weather/icons_new/${ GFX_TABLE.find(c=>c.code === payload.week[2].code).icon }.png`)
        ,Picto.getCanvas(HOST + ( easterEgg.skyline || `/build/weather/skylines/${  CONDITION.skyline || CONDITION.icon }.png`) )
    ]);


    ctx.drawImage(_SKY,0,0);
    
    // DRAW MAP
    ctx.save();
    ctx.globalAlpha =.4
    ctx.globalCompositeOperation = 'overlay'
    ctx.drawImage( _MAP,  325,105,350,350);
    ctx.restore();

    //DRAW POLLUX
    ctx.drawImage(_POLY,0,0);
    
    ctx.save();

    // DRAW WEEK CARDS
    ctx.translate(610,170)
    ctx.rotate( -.19235987755982988 );
    ctx.drawImage(createMinicard( [payload.week[0].high,payload.week[0].low], T_UNIT, payload.week[0].day,_MINI1 ),0,0,155,100);
    
    ctx.translate( 10,85);
    ctx.rotate( .19235987755982988 );
    ctx.drawImage(createMinicard( [payload.week[1].high,payload.week[1].low], T_UNIT, payload.week[1].day,_MINI2 ),0,0,155,100);
    
    ctx.translate( 10,85);
    ctx.rotate( .19235987755982988 );
    ctx.drawImage(createMinicard( [payload.week[2].high,payload.week[2].low], T_UNIT, payload.week[2].day,_MINI3 ),0,0,155,100);
    
    ctx.restore();
    
    // DRAW LOCATION CARD
    ctx.rotate( -.05835987755982988 );
    ctx.drawImage(createCountryTag( payload.city,payload.country.name,_FLAG,_SKYLINE,LOCAL_TIME),-40,490);
    ctx.restore();
    
    
    // DRAW TEMP
    let TEMP = Picto.tag(ctx,TEMPERATURE ,"italic 900 120pt 'Panton Black' ",'#FFF',{style: STROKE_COLOR, line: 25}).item;
    let TEMP_SHADOW = Picto.tag(ctx,TEMPERATURE ,"italic 900 120pt 'Panton Black' ",STROKE_COLOR,{style: STROKE_COLOR, line: 25}).item;
    ctx.drawImage( TEMP_SHADOW, 680+10 -TEMP.width ,470+10);
    ctx.drawImage( TEMP,        680 -TEMP.width ,470);
    
    // RECYCLE VAR FOR UNIT
    TEMP = Picto.tag(ctx,"°"+T_UNIT ,"italic 900 62pt 'Panton Black' ",'#FFF',{style: STROKE_COLOR, line: 25}).item;
    TEMP_SHADOW = Picto.tag(ctx,"°"+T_UNIT ,"italic 900 62pt 'Panton Black' ",STROKE_COLOR,{style: STROKE_COLOR, line: 25}).item;
    ctx.drawImage( TEMP_SHADOW, 630+10 ,530+10);
    ctx.drawImage( TEMP,        630 ,530);
    
    // CONDITION
    ctx.drawImage( _ICON,  580,20,200,200);

    

    let result = canvas.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': result.length
    });
    canvas.pngStream().pipe(res);
})

module.exports = router


