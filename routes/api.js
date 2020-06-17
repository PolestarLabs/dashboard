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
                if(!user) return cb(null,false,{message: "API Token Needed"});
                let resUser={
                    id: user.id,
                    apiKey: user._doc.apiKey,
                    apiPermission: user._doc.apiPerms || 'basic',
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


router.get('/items/:endpoint', async (req,res) => {

    if(req.params.endpoint == 'search'){
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','rarity','code','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        console.log({queries})
        queries.public = true;
        DB.items.find(queries,{name:1, rarity:1, event:1, icon:1, id:1, type:1}).then(result=>{
            res.json(result)
        })
    }

})


router.get('/cosmetics/:endpoint', async (req,res) => {

    if(req.params.endpoint == 'search'){
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','rarity','code','icon','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        console.log({queries})
        //queries.public = true;
        DB.cosmetics.find(queries,{_id:0,series:1,series_id:1,code:1, name:1,category:1, rarity:1, event:1, icon:1, id:1, type:1,BUNDLE:1,legacy:1,exclusive:1}).lean().exec().then(result=>{
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


router.get('/marketplace', async (req,res) => {
 
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','item_id','item_type','author','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        console.log({queries})
 
        console.log(queries)
        DB.marketplace.find(queries).then(result=>{
            console.log(result)
            res.json(result)
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

    let {page: skip} = req.query;

    let Relationship, Relationships;
    if (req.query.id){
        Relationship = await DB.relationships.findOne({_id: req.query.id }).lean().exec();
        if(!Relationship) return res.status(404).json("RELATIONSHIP ID NOT FOUND");
        return res.json( await relationshipParse(Relationship,req.query.plxdata) );
    }
    if (req.query.uid){
        Relationships = await DB.relationships.find({users: req.query.uid }).limit(10).skip(10*(skip||0)).lean().exec();
        if(!Relationships) return res.status(404).json("USER NOT FOUND");
        return res.json( await Promise.all(Relationships.map(REL => relationshipParse(REL,req.query.plxdata))) );
    }
    return res.status(400).json("BAD REQUEST");
 
});

async function relationshipParse(REL,dbData){

    let usersData = await Promise.all( REL.users.map(async U=>userCache.get( U ) || (await PLX.getRESTUser( U ))) );
    usersData.forEach(U=> userCache.set(U.id,U));
    if(dbData){
        let usersDBData = await DB.users.find( {id: {$in: usersData.map(u=>u.id)}},  {_id:0, "featuredMarriage":1,"modules.tagline":1} );
        usersData = usersData.map(discordUser =>{
            let userPayload = {
                id : discordUser.id,
                avatar : discordUser.avatar,
                bot : discordUser.bot,
                discriminator : discordUser.discriminator,
                username : discordUser.username,
            }
            const plxUserData =  usersDBData.find(u=>u.id === ud.id);
            if(!plxUserData) return userPayload;

            userPayload.tagline   = plxUserData.modules.tagline;               
            userPayload.featuredMarriage = plxUserData.featuredMarriage;
            return userPayload;                
        })
    };
   
   
    delete REL.__v
    REL.usersData = usersData;
    REL.id = REL._id
    delete REL._id
    return REL;
};



//router.get('/cosmetics')
//router.get('/collectibles')
//router.get('/localranks')
//router.get('/server')


 
module.exports = router  



