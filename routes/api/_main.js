const express = require('express');
const router = express.Router();
const cors = require('cors');
const helmet = require('helmet');

const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy

passport.use(new Strategy(
    (token,cb) =>{
        DB.users.get({apiKey:token}).then(user=>{
            if(!user) return cb(null,false,{message: "API Token Needed"});
            let resUser={
                id: user.id,
                apiKey: user.apiKey,
                apiPermission: user.apiPerms || 'basic',
                ip: user.personal.ip,
                location: `${user.personal.city}, ${user.personal.country}`,
            };

            return cb(null,resUser)
        })
    }
));

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
});


router.use( (req,res,nex)=>{
    if (req.headers.authorization && !req.user) return AUTHED(req,res,nex);
    nex();
});
global.cache= cacheFunction

router.get(cache(60));
router.use( (req,res,nex)=>{
    console.log(req.body)
    console.log( MARKET_TOKEN )
    if(req.method !== 'GET' && (!req.user && req.body.pollux != MARKET_TOKEN) ) return res.status(401).send("Nope");
    else nex();
});


router.use("/user/", async (...args) => {
    return (require('./users.js'))( ...args);
});

router.use(["/market/","/marketplace/"], async (...args) => {
    return (require('./shops/marketplace.js'))( ...args);
});

router.use(["/crafting/","/items/"], async (...args) => {
    return (require('./collections.js'))( ...args);
});

router.use(["/cosmetics/"], async (...args) => {
    return (require('./cosmetics.js'))( ...args);
});



//############################################

router.get('/discoin/currencies', async (req,res)=>{
    let units = await DB.globals.find({'type':'discoin'},{type:0,_id:0}).lean();
    res.json(units)
})


router.get('/achievements/:id',cache(2360), async (req,res) => {

    if(req.params.id == 'user'){
       
    }else{
        let achi = req.params.id
        DB.achievements.get({id:achi}).then(result=>{
            res.json(result)
        })
    }

})

router.get('/relationships', cache(1260), async (req, res)=> {

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
 
 
module.exports = router  