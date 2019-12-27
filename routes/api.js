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
            DB.users.getFull({apiKey:token}).then(user=>{
                if(!user) return cb(null,false,{message: "API Token Needed"});
                let resUser={
                    id: user.id,
                    apiKey: user._doc.apiKey,
                    apiPermission: user._doc.apiPerms || 'basic',
                    ip: user.personal.ip,
                    location: `${user.personal.city}, ${user.personal.country}`,
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
        DB.items.find(queries).then(result=>{
            res.json(result)
        })
    }

})
//router.get('/cosmetics')
//router.get('/collectibles')
//router.get('/localranks')
//router.get('/server')


 
module.exports = router  