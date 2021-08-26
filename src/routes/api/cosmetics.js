

const Picto = require(process.env.BOT_PATH+"/core/utilities/Picto.js");
const getColors = require('get-image-colors');
const express = require('express');
const axios  = require('axios');
const router = express.Router();
const {Types: MonTypes} = require("mongoose");

function CLEANUP(item) {
    if (!item) return null;
    if( !item.event ) item.event = false;
    //TODO whether the item is in current rotation or not
    return {
        unified_id: item._id,
        legacy_id: item.id,
        legacy_code: item.code,
        legacy_icon: item.icon,
        rarity: item.rarity,
        tags: item.tags?.split(' '),
        credit:{
            artist_name: item.artistName,
            artist_url: item.artistLink,
            artist_avatar: item.artistLink,
        },
        type: item.type,
        catalog: item.GROUP,
        bundle_info: item.BUNDLE,
        can_trade: item.tradeable || item.droppable || false,
        can_destroy: item.destroyable || item.droppable || false,
        drops: item.droppable || false,
        is_event: !!item.event,
        event_id: item.event ? item.event : undefined,
        release: new Date(parseInt( item._id.toString().substring(0,8), 16) * 1000)
    }
}


router.get("/all", cache(2600), async (req,res) =>{
    DB.cosmetics.find({ })
    .lean()
    .then(result=> res.json( result.map(CLEANUP) ) )
})
router.get("/search", cache(2600), async (req,res) =>{
    let queries = {};
    console.log('one')
    Object.keys(req.query)
        .filter(qry => ['_id','id','rarity','code','event','icon','type','expires','filter','name'].includes(qry) )
        .forEach(ky=> {
                queries[ky] = req.query[ky]
            })
    let sort = {_id:-1}
    //if (!queries.event) queries.event = 'none';
    queries.public = req.query.public !== 0;
    if (req.query.searchq){
        const qRegex = new RegExp(`.*${req.query.searchq}.*`,'i');
        const new_queries = {
            $and: [
                {$or: [
                    {name:qRegex},
                    {id:qRegex},
                    {tags:qRegex},
                    {artistName:qRegex},
                ]},
                queries
            ]
        };

        queries = Object.assign({},new_queries);

    }
    console.log(queries)
    DB.cosmetics.find(queries,{public:0,meta:0})
    .skip(parseInt(req.query.skip)||0)
    .limit( parseInt(req.query.lim)||50)
    .sort(sort).noCache().lean()
    .then(async result=>{
        if(result && req.query.type === 'sticker'){
            let packs = await DB.items.find({icon: {$in:result.map(x=>x.series_id)}}).lean();
            await Promise.all(packs.map(stickerCount));
            result.forEach(x=>{
                x.packData = packs.find(y=> y.icon === x.series_id )
            })
        }

        result.forEach(x=>{
            let timestamp = x._id.toString().substring(0,8)
            if( !x.event ) x.event = false;
            x.release = parseInt( timestamp, 16 ) * 1000
        })
        console.log(result)
        res.json(result)
    })
})

router.patch("/backgrounds/custom", (req,res) =>{ 
    delete require.cache[require.resolve("../forms/customBackground")];
    return (require("../forms/customBackground")).process(req,res);
 })
 
router.post("/backgrounds/custom", (req,res) =>{ 
    delete require.cache[require.resolve("../forms/customBackground")];
    return (require("../forms/customBackground")).createNew(req,res);
 })

router.get("/backgrounds/:id/:endpoint", async (req,res) =>{    
    const canvas = await Picto.getFullCanvas(`${HOST}/backdrops/${req.params.id}.png`);   
    let result = (await Promise.all( (await getColors( await canvas.toBuffer('image/png',{ compressionLevel: 0, filters: 8 }),{count:11, type:"image/png"})).map(color => getColorData(color.hex()) ))).filter((v,i,a)=> a.map(x=>x.hex).indexOf(v.hex) ==i );

    
    if (req.params.endpoint?.endsWith(".png")){
        const palette = Picto.new(500+(20*10),160);
        const ctx = palette.getContext('2d');
        result.forEach((color,i)=>{
            let Xpos =  (100 * i) + 20*(i+1);            
            Picto.roundRect(ctx, Xpos, 20, 100, 100, 20, color.hex);            
            Picto.roundRect(ctx, Xpos, 140, 100, 20, 5, "#FFF");
            Picto.setAndDraw(ctx, Picto.tag(ctx,color.name,'600 14px Panton', "#224"), Xpos + 50, 143, 90, align = "center");            
        })
        res.writeHead(200, {
            'Content-Type': 'image/png',
        });
        palette.pngStream().pipe(res);
    }else{
        res.status(200).json(result)
    }
})


router.get("/backgrounds/:id", cache(0.01), async (req,res) =>{
    PLX.redis.verbose = true;
    const {id: query} = req.params
    DB.cosmetics.findOne({type:"background",$or:[( MonTypes.ObjectId.isValid(query) ? {_id:query} :{id:query}) ,{code:query}]},{public:0,meta:0})
        .lean()
        .then(result=> res.json( CLEANUP(result) ) )
})

router.get("/medals/:id", cache(2600), async (req,res) =>{
    const {id: query} = req.params
    DB.cosmetics.findOne({type:"medal",$or:[( MonTypes.ObjectId.isValid(query) ? {_id:query} :{id:query}) ,{icon:query}]},{public:0,meta:0})
        .lean()
        .then(result=> res.json( CLEANUP(result) ) )
})

router.get("/count/:type", cache(3600), async (req,res) =>{
    const {type} = req.params;
    const {event,rarity} = req.query;
    const searchQuery = {type, public: true, rarity: rarity || {$ne:'XR'} };
    searchQuery.event = event || 'none';
    console.log({searchQuery})
    let response = await DB.cosmetics.find(searchQuery).noCache().count().catch(e=>"???");
    return res.status(200).json(response);
})



router.get("/:other/:id", cache(9999), async (req,res) =>{
    const {id: query, other} = req.params;
    DB.cosmetics.findOne({type: other.slice(0,-1) ,$or:[( MonTypes.ObjectId.isValid(query) ? {_id:query} :{id:query})]},{public:0,meta:0})
        .lean()
        .then(result=> res.json( CLEANUP(result) ) )
})


async function stickerCount(pack){
    let [pdata,mdata] = await Promise.all([
        DB.cosmetics.find({series_id:pack.icon},{name:1,id:1,rarity:1}).lean(),
        DB.items.find({id: {$in:pack.materials.map(x=>x.id||x) } },{name:1,id:1,rarity:1}).lean()
    ]);
    pack.materialsData = mdata;
    pack.size = pdata.length;
    pack.content = pdata;
    return pack;
}

module.exports = router


function getColorData(color){
    return new Promise(async resolve =>{
        let col = await (new Promise(async resolve => {
            PLX.redis.hget("colors",color,(err,colr)=>{
                resolve (JSON.parse(colr));
            }) ? null : resolve(false);
        })); 
        if (!col){
            console.log({col},"no-cache".red);
            let colorData = (await axios.get(`https://www.thecolorapi.com/id?hex=${color.replace("#","")}`))?.data;
            let res = {
                hex: colorData?.name?.closest_named_hex,
                name: colorData?.name?.value
            }
            PLX.redis.hset("colors",color,JSON.stringify(res));
            return resolve(res);
        }else{
            return resolve(col)
        }
    })
}
