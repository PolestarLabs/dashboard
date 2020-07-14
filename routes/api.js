// const DB = require('../database')
const express = require('express')
const router = express.Router()
const cors = require('cors')
const helmet = require('helmet')
const fx = require('../pipelines/globalFunctions.js');

const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy

passport.use(new Strategy(
        (token,cb) =>{
            DB.users.get({apiKey:token}).then(user=>{
                console.log({user})
                if(!user) return cb(null,false,{message: "API Token Needed"});
                let resUser={
                    id: user.id,
                    apiKey: user.apiKey,
                    apiPermission: user.apiPerms || 'basic',
                    ip: user.personal?.ip,
                    location: user.personal?`${user.personal?.city}, ${user.personal?.country}`:undefined,
                };

                return cb(null,resUser)
            })
        }    
    )
)

router.use(cors());
router.use(helmet());
const AUTHED = passport.authenticate('bearer', { session: false })
const MASTER = (rq,rs,nx) => rq.user.apiPermission === "master" ? nx() : rs.sendStatus(403);
const ADMIN  = (rq,rs,nx) => ['master','admin'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const TRUSTED= (rq,rs,nx) => ['master','admin','trusted'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const SPONSOR= (rq,rs,nx) => ['master','admin','sponsor'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const DONOR  = (rq,rs,nx) => ['master','admin','sponsor','donor'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);


router.get('/',AUTHED, (req, res)=> {
        res.json(req.user)
})


router.use( (req,res,nex)=>{
    if (req.headers.authorization && !req.user) return AUTHED(req,res,nex);
    nex();
});

router.get('/discoin/currencies', async (req,res)=>{
    let units = await DB.globals.find({'type':'discoin'},{type:0,_id:0}).lean().exec();
    res.json(units)
})

router.get('/user/:id',  async (req,res) => {
    let STATUS = 200
    const uID = req.params.id;
    let discordUser = await PLX.getRESTUser(uID).timeout(500).catch(e=>{ return {error:e.message} });
    DB.users.get(uID).then(USR=>{
        let response = {
            id: discordUser.id
            ,tag: discordUser.id ? (discordUser.username +"#"+ discordUser.discriminator) : ((USR||{}).meta||{}).tag
            ,avatar: discordUser.avatarURL
        }
        //if(discordUser.bot) return res.json(response);        
        if(!USR){
            STATUS = 404
            response.isPolluxUser = false;
            response.isBot = discordUser.bot;
        }else{            
            response.level=  USR.modules.level
            response.exp=  USR.modules.exp
            response.commends=  USR.modules.commend
            response.rubines=  USR.modules.rubines
            response.jades=  USR.modules.jades
            response.sapphires=  USR.modules.sapphires
            response.isDonator=  USR.donator && USR.donator != ""
            response.donatorTier=  USR.donator
            response.isBlacklisted=  USR.blacklisted && USR.blacklisted != ""?true:false
            response.profile= {
                background: USR.modules.bgID
                ,sticker: USR.modules.sticker
                ,color: USR.modules.favcolor
                ,flair: USR.modules.flairTop
                ,about: USR.modules.persotext
                ,tagline: USR.modules.tagline
                ,medals: USR.modules.medals
            } 
            response.inventorySize= USR.modules.inventory.reduce((a,b)=>a+b.count,0 )||0
        }
        if(discordUser.error) {
            STATUS = response.isPolluxUser?206:400
            response.discordDataUnavailable= discordUser.error
        };
        
        res.status(STATUS).jsonp(response)
       // res.json(USR._doc)
            
    })
})
router.get('/user/:id/inventory', async (req,res)=>{
    const uID = req.params.id;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.modules.inventory.filter(itm=> itm.count > 0 && typeof itm.id === 'string');
        let userMetaInventory = await DB.items.find({id: {$in: userInventory.map(i=>i.id) } });
        userInventory.forEach(item=>{
            item.meta = userMetaInventory.find(itm=>itm.id === item.id);
        })
        
        res.json(userInventory)

})

router.get('/items/:endpoint',   (req,res) => {

    if(req.params.endpoint == 'search'){
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['_id','id','rarity','code','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        console.log({queries})
        
        DB.items.find(queries,{name:1, rarity:1, event:1, icon:1, id:1, type:1}).then(result=>{
            console.log(result)
            res.json(result)
        })
    }

})


router.post('/crafting/mix',  async (req,res) => {

    const {pot} = req.body;
    const rars = ["C","U","R","SR","UR","XR"];
    const potTypeMap = pot.map(i=>i.type);
    
    let inventory, craftingHistory;
    if(req.user?.id){
        let [userData,userStats] = await Promise.all([
            DB.users.get(req.user.id, {'modules.inventory':1,'counters.crafted':1}),
            (await DB.users.get(req.user.id, {'modules.inventory':1,'counters.crafted':1}))?.data
        ]);
        inventory = (userData?.modules?.inventory || []).filter(x=>x.count > 0);
        craftingHistory = (userStats?.data?.crafted || []).map(x=>x.id);
        
    } 

    if (!pot) return res.status(400).json({error: "No Pot"});
    
    const query = {
        $or: [
            {materials: {$all:pot.map(i=>i.id)}},
            {'materials.id': {$all:pot.map(i=>i.id)}}
        ],
        //crafted: !0, display: !0
    };
    

    const queryExact = {
        $or: [
            {materials: {$size: pot.length, $all: pot.map(i=>i.id) }},
            {
                $and:pot.map(itm=>{
                    return {'materials.id': itm.id , 'materials.count': {$lte: itm.count} }
                }).concat({ materials: {$size: pot.length} })
            },
        ],    
        //crafted: !0, display: !0
    };
    let tCraftSize = ([...new Set( potTypeMap )]).length
    console.log({tCraftSize})


    
    let possible =  await DB.items.find(queryExact).lean().exec();
    console.log(possible,pot)
    if (!possible.length) possible = await DB.items.find(query).lean().exec();
    else possible.exact = true;
    
    if (!possible.length){
        
        const refinedPot = pot.map(item=> { item.count *= ((rars.indexOf(item.rarity)+1)/2); return item})
        let querySameType = {
            $and: pot.map(itm=>{
                let craftType = itm.type;
                let threshold = refinedPot.filter(i=>i.type === craftType ).reduce((a,b)=> ({count: a.count + b.count}))?.count || 0;

                return {
                    
                    'typeCraft.count': { $lte: threshold },
                    'typeCraft.type': craftType,
    
                }
            })
            .concat({'typeCraft.type': {$all: potTypeMap ,}}),
            //crafted: !0, display: !0
        };
        console.log({refinedPot})
        possible = await DB.items.find(querySameType).lean().exec();
        const potSorted = pot.sort((a,b) => rars.indexOf(b.rarity) - rars.indexOf(a.rarity) );
        const highestRar = potSorted[0].rarity;
        const lowestRar = potSorted[pot.length -1].rarity;



        console.table( {'length':possible.length,lowestRar,highestRar })  
        possible = possible.filter(x=> {  
            let isBetterThanLowest =  (rars.indexOf(x.rarity) >= (rars.indexOf(lowestRar) || 1))
            let isSameOrInferiorThanBest = rars.indexOf(x.rarity) <= rars.indexOf(highestRar);
            console.table({
                thisRAR: x.rarity,lowestRar, highestRar,isBetterThanLowest,
                isSameOrInferiorThanBest

            })        
            return isBetterThanLowest && isSameOrInferiorThanBest
        });
        console.log('length',possible.length)  
        
        
        if (possible.length){            
            possible = [shuffle(possible)[0]]
            possible.typeCraft = true
        }else{
            querySameType = {'typeCraft.type' : {$all: potTypeMap } }
            if (pot.length === 3) querySameType.rarity = {$in: pot.map(i=>i.rarity)};
            console.log(querySameType)        
            possible = await DB.items.find(querySameType).lean().exec();
            possible.typeCraft = true
            possible.notQuite = true
        }
  
    } 
        


    
    if (possible.exact && possible.length > 1){
        
        let possiblest = possible.sort((a,b)=>{
            //if (craftingHistory.includes(a.id)) return -1;
            //if (inventory.map(x=>x.id).includes(a.id)) return -1;
            if ( a.materials.every(x=> x.count <= pot.find(y=> y.id == x.id)?.count ) ) return -1;
            if ( rars.indexOf(a.rarity) < rars.indexOf(b.rarity) ) return -1;
            if ( rars.indexOf(a.rarity) > rars.indexOf(b.rarity) ) return  1;
            if ( a.level < b.level  ) return  -1;
            if ( a.level > b.level  ) return   1;
        })
        possible = [possiblest[0]]
        possible.exact = true;
    }

    

    if (possible.typeCraft && !possible.notQuite){

        let discovery   = possible[0];
        
        let canCraftNow = !possible.notQuite;
        let isDiscovery = true;

        return res.json({discovery, isDiscovery, canCraftNow, typeCraft: true});
        
    }
    

    if (possible.exact){

        let discovery = possible[0];
        let canCraftNow = isExact(pot,discovery.materials);
        let isDiscovery = itemsMatch(pot, discovery.materials);

        return res.json({discovery, isDiscovery, canCraftNow});
        
    }else{
        return res.json({
            possible: possible.length ||0, 
            inventory
            
        })
    };





   


    
    
    DB.items.find({$or: [{materials: {$all:items}}, {'materials.id': {$all:items}}], crafted: !0, display: !0},
        {name:1, rarity:1, event:1, icon:1, id:1, type:1, gemcraft: 1, materials: 1, code: 1}).then(result=>{
        
            result.map(itm=> {
                itm.materials.every(t=>items.includes(t))
            })
        res.json(result)
    })
     
})

function isExact(pot,recipe){
    return itemsMatch(pot,recipe) &&
    recipe.every(item=>{
        let material = pot.find(m=> m.id === (item.id||item) );
        if (!material) return false;
        let needs = item.count || 1;
        let has = material.count;
        return has >= needs
    });
}

function itemsMatch(pot,recipe){
    return pot.length === recipe.length &&
    recipe.every(item=> 
        !!pot.find(m=> 
            m.id === (item.id || item)
        )
    );     
}

router.get('/crafting/:endpoint',   (req,res) => {

    if(req.params.endpoint == 'search'){
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','rarity','code','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
 
        queries.crafted = true
        queries.display = true

        DB.items.find(queries, {name:1, rarity:1, event:1, icon:1, id:1, subtype:1, type:1, gemcraft: 1, materials: 1, code: 1}).then(result=>{
            console.log(result)
            res.json(result)
        })
    }else{
        DB.items.find({id:req.params.endpoint, crafted: !0, display: !0},
            {name:1, rarity:1, event:1, icon:1, id:1, type:1, gemcraft: 1, materials: 1, code: 1}).then(result=>{
            console.log(result)
            res.json(result)
        })
    }
})


router.get('/cosmetics/:endpoint', async (req,res) => {

    if(req.params.endpoint == 'search'){
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['_id','id','rarity','code','icon','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        console.log({queries})
        let sort = {_id:-1}
        //queries.public = true;
        DB.cosmetics.find(queries,{_id:0,series:1,series_id:1,code:1, name:1,category:1, rarity:1, event:1, icon:1, id:1, type:1,BUNDLE:1,legacy:1,exclusive:1,artistName:1,artistLink:1,artistImg:1})
        .skip(parseInt(req.query.skip)||0)
        .limit( parseInt(req.query.lim)||50)
        .sort(sort)
        .lean().exec().then(result=>{
            res.json(result)
        })
    }

})

router.get('/achievements/:id', async (req,res) => {

    if(req.params.id == 'user'){
       
    }else{
        let achi = req.params.id
        DB.achievements.get({id:achi}).then(result=>{
            res.json(result)
        })
    }

})
function getItemMarketDetails(item){
    return new Promise(async (resolve,reject)=>{

        const [cos,itm] = await Promise.all([
            DB.cosmetics.find({_id: item }).lean().exec(),
            DB.items.find({_id: item }).lean().exec()
        ]).catch(async ()=> { 
            return  await Promise.all([
                DB.cosmetics.find({$or:[{id: item},{icon: item},{code: item}] }).lean().exec(),
                DB.items.find({id: item }).lean().exec()
            ]).catch(e=> { 
                return reject(400,"Bad Request");
            })
        });
        const result = cos.concat(itm)[0];
        if(!result) return reject(404,"item not found");
        const marketplace = await DB.marketplace.find({item_id:result._id}).lean().exec();
        const marketplacePriceMap = marketplace.map(x=> (x.currency === 'SPH' ? 1000 : 1) * x.price );
        
        const response = {
            item: result,
            max: Math.max(...marketplacePriceMap),
            min: Math.max(...marketplacePriceMap),
            average: marketplacePriceMap.reduce((a,b)=> a + b,0) / marketplace.length,
            entries: marketplace
        }
        return resolve(response);
    })
}
router.get('/marketplace/:item', async (req,res) => {
    const {item} = req.params;
       
    getItemMarketDetails(item).catch((code,reason)=>{
        res.status(code).json({reason})
    }).then(response=>{
        res.json(response)
    });
})
router.get('/marketplace', async (req,res) => {
 
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','item_id','item_type','author','type','price'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
 
 
        if (req.query.after){

            queries.timestamp = {$gte: Number(req.query.after) || Date.now() - 86400000 }
        }
        if (req.query.before){
            queries.timestamp = {$lte: Number(req.query.before) || Date.now()  }
        }

        let lim = Math.min( Number(req.query.limit) || 25, 100 );
        let skip = Number(req.query.skip) || 0;
        let sort = req.query.sort == 'oldest' ? 1 : -1

 
        DB.marketplace.find(queries, {__v:0}).sort({timestamp: sort}).limit(lim).skip(skip).then(async result=>{
     
            let [marketeers,cosmetics,goods]  = await Promise.all([
                DB.users.find({id:{$in:result.map(i=>i.author)}},{meta:1,id:1}).lean().exec(),
                DB.cosmetics.find({_id:{$in:result.map(i=>i.item_id)}}).lean().exec(),
                DB.items.find({_id:{$in:result.map(i=>i.item_id)}}).lean().exec()
            ]);
 console.log(result)
            let newThing=
                result.map(entry=>{
                    return Object.assign( 
                        { itemdata: cosmetics.concat(goods).find(i=>i._id==entry.item_id)},
                        { userdata: marketeers.find(u=>u.id===entry.author).meta},
                        entry._doc
                    );
                });

            res.json(newThing)
        }).catch(e=>{
            console.error(e)
            res.send("What the fuck are you trying?")
        })

})


router.get('/commends', async (req,res)=>{
     
    if(!req.query.full)  return res.json( await DB.commends.get(req.query.uid || req.user.id , {_id: 0, __v:0}) );
    if(req.query.full==1){
        const userCommends = (await DB.commends.get(req.query.uid || req.user.id , {_id: 0, __v:0}));
        if(!userCommends)  return res.status(404).json(null);
        let users =  [...new Set(
                userCommends.whoIn.map(u=>u.id).slice(0,10).concat(userCommends.whoOut.map(u=>u.id).slice(0,10))
            )]

            const payload = {};
            payload.whoOut = userCommends.whoOut;
            payload.userdata = await Promise.all(users.map(usr=> (userCache.get(usr)) || PLX.getRESTUser(usr)));
            payload.whoIn = userCommends.whoIn.sort((a,b)=> b.count - a.count )
        return res.json(payload);
    }
    const commendDataIn = DB.commends.aggregate(
        [
            { $match: { id: req.query.uid || req.user.id  } }, 
            { $limit: 10},
            {
                $lookup: {
                    from: "userdb",
                    let: {in: '$whoIn' , out: '$whoOut'},
                    pipeline: [
                        {$match: { $expr: {$or: [ {$in: ['$id','$$in.id'] },{$in: ['$id','$$out.id'] } ] }}},
                        { $project: { meta: 1, id: 1, _id: 0 } },
                        { $unwind: "$meta" }
                    ],
                    as: "userdata"
                }
            }
        ]
    ).allowDiskUse(!0).exec().then(result=>{
        result[0].userdata = result[0].userdata.map(udata=> {let udt = udata.meta; udt.id = udata.id; return udt} )
        result[0].whoIn = result[0].whoIn.sort((a,b)=> b.count - a.count )
        res.json(result[0])
    });

    

   
})


router.get('/commendrank/:id/:endpoint', async (req,res)=>{
 
    const ID = req.params.id
    const count = (await DB.commends.get(ID))?.whoIn?.reduce((a,b)=> ({count: a.count + b.count}))?.count;
    const rank = (await DB.commends.aggregate(
        [            
            {
                $addFields: {
                
                "countIn":{$sum:"$whoIn.count"},
                "countOut":{$sum:"$whoOut.count"},
                }
            },
            {$match:{ [req.params.endpoint === 'in' ? 'countIn' : 'countOut']: {$gt: count} }},
            {
                $project: {
                
                    "id": 1,
                    "whoOut": 1,
                    "whoIn": 1,
                    "pplIn": { "$size": "$whoIn" },
                    "pplOut": { "$size": "$whoOut" }
                
                }
            },
            {$count:'count'}
        ]
    ))[0]?.count;     
        return res.json({rank,count});
})

router.get('/relationships', async (req, res)=> {

    console.log('start')

    let {page: skip} = req.query;

    let Relationships;
    if (req.query.id){
        Relationships = await DB.relationships.find({_id: req.query.id }).lean().exec();
        if(!Relationships) return res.status(404).json("RELATIONSHIP ID NOT FOUND");
    }
    if (req.query.uid){
        Relationships = await DB.relationships.find({users: req.query.uid }).limit(10).skip(10*(skip||0)).lean().exec();
        if(!Relationships) return res.status(404).json("USER NOT FOUND");
    }

    console.log('p1')

    let usersInvolved = Relationships.map(R=> R.users.find(u=> u!=req.query.uid) ).concat(req.query.uid);
    
    let [usersData,usersDBdata] = await Promise.all([
        Promise.all( usersInvolved.map(async U => userCache.get( U ) || PLX.getRESTUser( U )) ),
        (req.query.plxdata ? DB.users.find( {id: {$in: usersInvolved}},  {_id:0, id:1,"featuredMarriage":1,"modules.tagline":1} ) : null)
    ]);
    usersData.forEach(USR=> userCache.set(USR.id,USR) );

    console.log('p2')

    let parsedRelationships = []
    Relationships.forEach(rel=>{
        console.log(0)
        let item = {
            type: rel.type,
            initiative: rel.initiative, 
            ring: rel.ring,
            since: rel.since,
            id: rel._id,
            users: rel.users,
            usersData: rel.users.map(u=> {
                let udbData = {};
                let {avatar,bot,discriminator,username} = usersData.find(usr=> usr.id === u);
                if(usersDBdata) udbData = usersDBdata.find(usr=> usr.id === u);           
                
                return  Object.assign( {id:u, avatar, bot, discriminator, username} , {tagline:udbData?.modules?.tagline,featuredMarriage:udbData?.featuredMarriage} )
            })
        };
        parsedRelationships.push(item)
    });
    
    console.log('end')
    return res.json( parsedRelationships);
 
});
 

//router.get('/cosmetics')
//router.get('/collectibles')
//router.get('/localranks')
//router.get('/server')


 
module.exports = router  



