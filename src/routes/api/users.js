
const express = require('express');
const router = express.Router();


router.get('/search',  cache(600), async(req,res)=>{
    let queries = {}
    Object.keys(req.query)
        .filter(qry => ['_id','id','prime.tier','name','meta.tag','personalhandle'].includes(qry) )
        .forEach(ky=> queries[ky] = req.query[ky])

    if(queries['prime.tier'] == 'exists') queries['prime.tier'] = {$exists:true};
    let sort = {_id:-1}

    DB.users.find(queries)
        .skip(parseInt(req.query.skip)||0)
        .limit( parseInt(req.query.lim)||50)
        .sort(sort).lean()
        .then(async result=>{
            let result_2 = await Promise.all(result.map(async USR=>{
                let discordUser =   (await userCache.get( USR.id )) || (await PLX.getRESTUser( USR.id ).catch(e=>{ id: "error" }));
                if (!discordUser) return null;
                userCache.set(discordUser.id,discordUser);
                let { response } = parse_userdata(discordUser, USR, 0);
                return response;
            }));
            
            return res.json(result_2)
        })
})


router.use('/:id/', (req,res,nex)=>{
    if (req.params.id === "check_handle") return nex();
    res.locals.userID = req.params.id
    if (req.params.id === '@me') res.locals.userID = req.user.id;
    nex();
})

router.get('/:id', cache(30), async (req,res) => {
    let STATUS = 200
    const uID = res.locals.userID
    
    return parseUserAndReturn( uID, res);
})
 
router.get('/:id/inventory', async (req,res)=>{
    const uID = res.locals.userID;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.profile.inventory.filter(itm=> itm.count > 0 && typeof itm.id === 'string');
        let userMetaInventory = await DB.items.find({id: {$in: userInventory.map(i=>i.id) } });
        userInventory.forEach(item=>{
            item.meta = userMetaInventory.find(itm=>itm.id === item.id);
        })
        
        res.json(userInventory)

})
router.get('/:id/stickers', async (req,res)=>{
    const uID = res.locals.userID;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.profile.stickerInventory.filter(x=>!!x);
        let userMetaInventory = await DB.cosmetics.find({id: {$in: userInventory } }).lean();

        let packs = await DB.items.find({icon: {$in: userMetaInventory.map(x=>x?.series_id)}}).lean();
        
        userMetaInventory.forEach(x=>{
            x.packData = packs.find(y=> y.icon === x.series_id )            
        })
        
        
        res.json(userMetaInventory)

})
router.get('/:id/medals', async (req,res)=>{
    const uID = res.locals.userID;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.profile.medalInventory.filter(x=>!!x);
        let userMetaInventory = await DB.cosmetics.find({icon: {$in: userInventory } }).lean().noCache();
        console.log({userInventory})
        
        res.json(userMetaInventory)

})
router.get(['/:id/bgs','/:id/backgrounds'], async (req,res)=>{
    const uID = res.locals.userID;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.profile.bgInventory.filter(x=>!!x);;
        let userMetaInventory = await DB.cosmetics.find({code: {$in: userInventory } }).lean();
        
        res.json(userMetaInventory)

})


router.get('/:id/commends', cache(360), async (req,res)=>{
    const uID = res.locals.userID;
    if(!req.query.full)  return res.json( await DB.commends.parseFull(uID || req.user.id ) );
    if(req.query.full==1){
        const userCommends = (await DB.commends.parseFull(uID || req.user.id , {_id: 0, __v:0}));
        if(!userCommends)  return res.status(404).json(null);
        let users =  [...new Set(
                userCommends.whoIn.map(u=>u.id).slice(0,10).concat(userCommends.whoOut.map(u=>u.id).slice(0,10))
            )]

            const payload = {};
            payload.userdata = await Promise.all(users.map(async usr=> (await userCache.get(usr)) || PLX.getRESTUser(usr)));
            payload.whoIn = userCommends.whoIn.sort((a,b)=> b.count - a.count )||[];
            payload.whoOut = userCommends.whoOut.sort((a,b)=> b.count - a.count )||[];
            payload.totalIn = userCommends.totalIn || 0;
            payload.totalOut = userCommends.totalOut || 0;
            payload.average = ~~( payload.totalIn / payload.whoIn.length) || 0;
            payload.normalized = ~~( (payload.totalIn * payload.whoIn.length) / (payload.totalIn / payload.average) ) || 0;

        return res.json(payload);
    }
    /*
    const commendDataIn = DB.commends.aggregate(
        [
            { $match: { id: uID || req.user.id  } }, 
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

    */

   
})

router.get('/:id/commends/:endpoint',cache(360), async (req,res)=>{
 
    const ID = res.locals.id
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

router.post(['/fanart-hearts/:operation/:id'], async (req,res)=>{

    const uID = req.user.id;
    if(!uID) return res.sendStatus(403);
    let fana = await DB.collections.fanart.findOne({id:req.params.id});
    if(!fana) return res.sendStatus(404);

    if(req.params.operation === "add"){        
        Promise.all([
            DB.users.set(uID,{$addToSet: {'counters.hearts': req.params.id} }),
            DB.collections.fanart.updateOne({id:req.params.id},{$inc:{hearts:1}})
        ]).then(r=> res.sendStatus(200)).catch(e=> console.error(e) && res.sendStatus(500));
    }else{
        Promise.all([
            DB.users.set(uID,{$pull: {'counters.hearts': req.params.id} }),
            DB.collections.fanart.updateOne({id:req.params.id},{$inc:{hearts:-1}})
        ]).then(r=> res.sendStatus(200)).catch(e=> console.error(e) && res.sendStatus(500));
    }

})


router.get('/:id/galleries/saves', async (req,res)=>{
    const [gallery,user] = await Promise.all([
        DB.usercols.get(req.params.id),
        DB.users.get(req.params.id,{switches:1})
    ]);
    if (user.switches?.booruPublic === false){
        res.json( {loading: true, status: "PRIVATE"} );
    }else{
        res.json( gallery?.collections.boorusave||[])
    }
});

router.get('/:id/galleries/fanart', async (req,res)=>{
    const query = {author_ID:req.params.id};
    req.user?.id === req.params.id ? false : query.publish = true;

    DB.fanart.find(query).lean().then(gal=>{
        res.status(200).json(gal.map(item=>{
            return {
                title: item.title,
                description: item.description,
                author: item.author_ID,
                author_url: item.artistlink,
                likes: item.hearts || 0,
                url: item.src,
                thumb: item.src.replace('artwork/','artwork/thumbs/'),
                status: item.publish ? "published" : item.publish === false ? "denied" : "pending"
            }
        }))
    })
})




module.exports = router

async function parseUserAndReturn(uID, res) {
    let STATUS = 200
    let discordUser =   (await userCache.get( uID )) || (await PLX.getRESTUser( uID ).catch(e=>{ error: "error" }));
    userCache.set(discordUser.id,discordUser);

    return DB.users.get(uID).then(USR => {
        let response;
        ({ response, STATUS } = parse_userdata(discordUser, USR, STATUS));

        return res.status(STATUS).json(response);
        // res.json(USR._doc)
    }); 
}
function parse_userdata(discordUser, USR, STATUS) {
    let response = {
        id: discordUser.id,
        tag: discordUser.id ? discordUser.username : ((USR || {}).meta || {}).tag,
        avatar: discordUser.avatarURL
    };
    //if(discordUser.bot) return res.json(response);        
    if (!USR) {
        STATUS = !discordUser ? 404 : 206;
        response.isPolluxUser = false;
        response.isBot = discordUser.bot;
    }
    else {
        response.level = USR.progression.level;
        response.exp = USR.progression.exp;
        response.commends = USR.counters?.commend;
        response.RBN = USR.currency.RBN;
        response.JDE = USR.currency.JDE;
        response.SPH = USR.currency.SPH;
        response.isDonator = USR.prime?.tier && USR.prime.tier != "";
        response.donatorTier = USR.prime?.tier;
        response.isBlacklisted = USR.blacklisted && USR.blacklisted != "" ? true : false;
        response.profile = {
            background: USR.profile.bgID,
            sticker: USR.profile.sticker,
            color: USR.profile.favcolor,
            flair: USR.profile.flairTop,
            about: USR.profile.persotext,
            tagline: USR.profile.tagline,
            medals: USR.profile.medals
        };
        response.inventorySize = USR.profile.inventory?.reduce((a, b) => a + b.count, 0) || 0;
    }
    if (discordUser.error) {
        console.log("AAAAAAAAAAAAAAAAA".red)
        console.log("AAAAAAAAAAAAAAAAA".red)
        console.log("AAAAAAAAAAAAAAAAA".red)
        console.log({discordUser})
        STATUS =   response.isPolluxUser ? 206 : 400;
        response.discordDataUnavailable = discordUser.error;
    };
    return { response, STATUS };
}

