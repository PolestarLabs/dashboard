

const express = require('express');
const router = express.Router();

function CLEANUP(item) {
    if(item.event == 'none' ) item.event = false;
    return {
        id: item._id,
        legacy_id: item.id,
        legacy_code: item.code,
        legacy_icon: item.icon,
        rarity: item.rarity,
        credit:{
            artist_name: item.artistName,
            artist_url: item.artistLink,
            artist_avatar: item.artistLink,
        },
        type: item.type,
        catalog: item.GROUP,
        bundle_info: item.BUNDLE,
        is_event: !!item.event,
        event_id: item.event ? item.event : undefined,
        release: new Date(parseInt( item._id.toString().substring(0,8), 16) * 1000)
    }
}


router.get("/search", cache(2600), async (req,res) =>{
    let queries = {}
    Object.keys(req.query)
        .filter(qry => ['_id','id','rarity','code','event','icon','type','expires', 'name'].includes(qry) )
        .forEach(ky=> {
                queries[ky] = req.query[ky]
            })
    let sort = {_id:-1}
    if (!queries.event) queries.event = 'none';
    queries.public = req.query.public !== 0;
    console.log(queries)
    DB.cosmetics.find(queries,{public:0,meta:0})
    .skip(parseInt(req.query.skip)||0)
    .limit( parseInt(req.query.lim)||50)
    .sort(sort).lean()
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
            if(x.event == 'none' ) x.event = false;
            x.release = parseInt( timestamp, 16 ) * 1000
        })
        console.log(result)
        res.json(result)
    })
})

router.get("/backgrounds/:id", cache(0.01), async (req,res) =>{

    DB.cosmetics.find({type:"background",id:req.params.id},{public:0,meta:0})
        .skip(parseInt(req.query.skip)||0)
        .limit( parseInt(req.query.lim)||50)
        .lean()
        .then(async result=>{            
            res.json( result.map(CLEANUP) );
        })
})

router.get("/medals/:id", cache(2600), async (req,res) =>{   
    DB.cosmetics.find({type:"medal",id:req.params.id},{public:0,meta:0})
        .skip(parseInt(req.query.skip)||0)
        .limit( parseInt(req.query.lim)||50)
        .lean()
        .then(async result=>{
            res.json( result.map(CLEANUP) );
        })
})




router.get("/count/:type", cache(360000), async (req,res) =>{
    const {type} = req.params;
    const {event,rarity} = req.query;
    let response = await DB.cosmetics.find({type, public: true, event: event||"none", rarity: rarity || {$ne:'XR'} }).count().catch(e=>"???");
    return res.json(response);
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
