const config = require("../../../config.js");
const express = require('express');
const router = express.Router();
const cors = require('cors');
const helmet = require('helmet');

const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;


passport.use(new Strategy(
    (token,cb) =>{
        DB.users.get({apiKey:token}).then(user=>{
            if(!user) return cb(null,false,{message: "API Token Needed"});
            let resUser={
                id: user.id,
                apiKey: user.apiKey,
                apiPermission: user.apiPerms || 'basic',
                ip: user.personal?.ip || "Unknown",
                location: user.personal?`${user.personal.city}, ${user.personal.country}`:"Unknown",
            };

            return cb(null,resUser)
        })
    }
));

router.use(cors());
router.use(helmet());

const AUTHED = (rq,rs,nx) => rq.user ? nx() : (passport.authenticate('bearer', { session: false }))(rq,rs,nx);
const FIRST_PARTY = (rq,rs,nx) => ['master','admin','first_party'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const MASTER = (rq,rs,nx) => rq.user.id === config.data_controller || rq.user.apiPermission === "master" ? nx() : rs.sendStatus(403);
const ADMIN  = (rq,rs,nx) => ['master','admin'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const TRUSTED= (rq,rs,nx) => ['master','admin','trusted'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const SPONSOR= (rq,rs,nx) => ['master','admin','sponsor'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
const DONOR  = (rq,rs,nx) => ['master','admin','sponsor','donor'].includes(rq.user.apiPermission) ? nx() : rs.sendStatus(403);
router.get('/',AUTHED, (req, res)=> {
	res.json(req.user)
});
router.get('/master',MASTER, (req, res)=> {
	res.json(req.user)
});


router.use( (req,res,nex)=>{
    Object.keys(require.cache).forEach((r)=>{
        //FIXME[epic=anyone] remember to remove this on prod
        if(r.includes("/api/")) delete require.cache[r];
    })
    //if (req.headers.authorization && !req.user) return AUTHED(req,res,nex);
    nex();
});
global.cache= cacheFunction

router.get((rq,rs,nx)=> {
    if(rq.query.nocache) nx();
    else (cache(60))(rq,rs,nx);
});

router.use( (req,res,nex)=>{    
    //console.log( {MARKET_TOKEN} )
    return nex();
    if(req.method !== 'GET' && (!req.user && req.body.pollux != MARKET_TOKEN) ) return res.status(401).send("Nope");
    else nex();
});


router.use("/user/", async (...args) => {
    delete require.cache[(require.resolve('./users.js'))];
    return (require('./users.js'))( ...args);
});

router.use(["/market/","/marketplace/","/shop/marketplace"], async (...args) => {
    delete require.cache[(require.resolve('./shops/marketplace.js'))];
    return (require('./shops/marketplace.js'))( ...args);
});

router.use(["/shop/","/store/"], async (...args) => {
    delete require.cache[(require.resolve('./shops/main.js'))];
    return (require('./shops/main.js'))( ...args);
});

router.use(["/playlists/","/music/playlists/"],AUTHED,FIRST_PARTY, async (...args) => {
    delete require.cache[(require.resolve('./playlists.js'))];
    return (require('./playlists.js'))( ...args);
});

router.use(["/music/"],AUTHED,FIRST_PARTY, async (...args) => {
    delete require.cache[(require.resolve('./music.js'))];
    return (require('./music.js'))( ...args);
});

router.use(["/games/:game","/minigames/:game"], async (req,res) => {
    const {game} = req.params;
    try {
        delete require.cache[(require.resolve('./games/'+game+'.js'))];
        return (require('./games/'+game+'.js'))( req,res );
    } catch (err) {
        return res.sendStatus(404);
    }
});

router.use(["/crafting/","/items/"], async (...args) => {
    delete require.cache[(require.resolve('./collections.js'))];
    return (require('./collections.js'))( ...args);
});

router.use(["/cosmetics/"], async (...args) => {
    delete require.cache[(require.resolve('./cosmetics.js'))];
    return (require('./cosmetics.js'))( ...args);
});

router.use(["/interactions/"], async (...args) => {
    delete require.cache[(require.resolve('./interactions/_main.js'))];
    return  (require('./interactions/_main.js'))( ...args);

});

router.use(["/prime/checkUser/:userID"], async (req,res,next) => {
    if (!req.user) return rs.sendStatus(401);
    if ( 
        req.user.id !== req.params.userID &&
        !['master','admin','first_party'].includes(req.user.apiPermission) &&
        !req.user.id === config.data_controller
    ) return res.sendStatus(403);

    delete require.cache[(require.resolve('./prime.js'))];
    return  (require('./prime.js'))(req,res,next);
});
router.use(["/prime/"], AUTHED, MASTER, async (...args) => {
    delete require.cache[(require.resolve('./prime.js'))];
    return  (require('./prime.js'))( ...args);
});

router.use(["/utils/"], async (...args) => {
    delete require.cache[(require.resolve('./utils.js'))];
    return (require('./utils.js'))( ...args);
});

router.use(["/internal/"], async (...args) => {
    delete require.cache[(require.resolve('./internal.js'))];
    return (require('./internal.js'))( ...args);
});

//############################################

router.get('/discoin/currencies', async (req,res)=>{
    let units = await DB.globals.find({'type':'discoin'},{type:0,_id:0,data:0}).lean();
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

router.get('/leaderboards/user/:userID', cache(1260), async (req, res)=> {
    const {userID} = req.params;
    if(!req.user || req.user.id !== userID) return res.sendStatus(403);
    let userData = await DB.localranks.find({user:userID},{_id:0,__v:0}).lean();
    return res.json(userData);
});

router.get('/leaderboards/:serverID', cache(600), async (req, res)=> {
    const {serverID} = req.params;
    const page = Math.abs(parseInt(req.query.page ||0) - 1);
    let serverData = await DB.localranks.find({server:serverID},{_id:0,__v:0}).limit(50).skip(50*(page)).lean();
    const total =  (await DB.localranks.find({server:serverID}).count());

    res.json({
        currentPage: page+1,
        totalItems: total,
        totalPages: ~~(total / 50),
        data: serverData,
        lastUpdated: new Date()
    });
});

router.get('/leaderboards/:serverID/:userID', cache(1260), async (req, res)=> {
    const {serverID,userID} = req.params;
    let userData = await DB.localranks.get({user:userID,server:serverID},{_id:0,__v:0});
    res.json(userData);
});

router.get('/relationships', cache(1260), async (req, res)=> {

    let {page: skip} = req.query;

    let Relationships;
    if (req.query.id){
        Relationships = await DB.relationships.find({_id: req.query.id }).populate({path: 'usersData', select:'featuredMarriage id modules.tagline'}).lean();
        if(!Relationships) return res.status(404).json("RELATIONSHIP ID NOT FOUND");
    }
    if (req.query.uid){
        Relationships = await DB.relationships.find({users: req.query.uid }).limit(10).skip(10*(skip||0)).populate('usersData').lean();
        if(!Relationships) return res.status(404).json("USER NOT FOUND");
    }

    let usersInvolved = Relationships.map(R=> R.users.find(u=> u!=req.query.uid) ).concat(req.query.uid);
    
    let usersDiscordData = await Promise.all( usersInvolved.map(async U => (await userCache.get( U )) || PLX.getRESTUser( U )) );
    usersDiscordData.forEach(USR=> userCache.set(USR.id,USR) );


    let parsedRelationships = []
    Relationships.forEach(rel=>{
        let item = {
            type: rel.type,
            initiative: rel.initiative, 
            ring: rel.ring,
            since: rel.since,
            id: rel._id,
            users: rel.users,
            usersData: rel.users.map(u=> {
                let udbData = {};
                let {avatar,bot,discriminator,username} = usersDiscordData.find(usr=> usr.id === u);
                if(rel.usersData) udbData = rel.usersData.find(usr=> usr.id === u);           
                
                return  Object.assign( {id:u, avatar, bot, discriminator, username} , {tagline:udbData?.modules?.tagline,featuredMarriage:udbData?.featuredMarriage} )
            })
        };
        parsedRelationships.push(item)
    });
    
    return res.json( parsedRelationships);
 
});
 
 //router.post('/galleries/fanart')
router.delete('/galleries/fanart/:id',  async (req,res)=>{
    
    const oldData = await DB.fanart.get(req.params.id);
    if (!oldData) return res.sendStatus(404);
    if (!req.user.id) return res.sendStatus(401);
    if (oldData.author_ID !== req.user?.id) return res.sendStatus(403);

    DB.fanart.remove( {id: req.params.id } )
        .then(id=>{
            res.status(200).json('DELETED');
        })
        .catch(err=> console.log(err) && res.status(500).json('ERROR') )
} )

router.put('/galleries/fanart/:id/:what',  async (req,res)=>{

    const data = req.body;
    const oldData = await DB.fanart.get(req.params.id);

    if (!oldData) return res.sendStatus(404);
    if (!req.user.id) return res.sendStatus(401);
    if (oldData.author_ID !== req.user?.id) return res.sendStatus(403);
    
    if (req.params.what === 'twitter'){
        let result = await DB.fanart.updateMany({author_ID: oldData.author_ID }, {$set:{artistTwit: data.value}});
        return res.status(200).json(result);
    }
    if (req.params.what === 'link'){
        let result = await DB.fanart.updateMany({author_ID: oldData.author_ID }, {$set:{artistlink: data.value}});
        return res.status(200).json(result);
    }

    const payload = {};
    data.title ? payload.title = data.title : false;
    data.description ? payload.description = data.description : false;

    let result = await DB.fanart.set( {id: req.params.id }, {$set: payload});
    
    return res.status(200).json(result);

} )



module.exports = router  