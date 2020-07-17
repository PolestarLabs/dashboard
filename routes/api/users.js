
const express = require('express');
const router = express.Router();



router.get('/:id', cache(30), async (req,res) => {
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
router.get('/:id/inventory', async (req,res)=>{
    const uID = req.params.id;
        
        let USR = await DB.users.get(uID);
        let userInventory = USR.modules.inventory.filter(itm=> itm.count > 0 && typeof itm.id === 'string');
        let userMetaInventory = await DB.items.find({id: {$in: userInventory.map(i=>i.id) } });
        userInventory.forEach(item=>{
            item.meta = userMetaInventory.find(itm=>itm.id === item.id);
        })
        
        res.json(userInventory)

})


router.get('/:id/commends', cache(360), async (req,res)=>{
     
    if(!req.query.full)  return res.json( await DB.commends.get(req.params.id || req.user.id , {_id: 0, __v:0}) );
    if(req.query.full==1){
        const userCommends = (await DB.commends.get(req.params.id || req.user.id , {_id: 0, __v:0}));
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
            { $match: { id: req.params.id || req.user.id  } }, 
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

router.get('/:id/commends/:endpoint',cache(360), async (req,res)=>{
 
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

module.exports = router