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
                apiKey: user._doc.apiKey,
                apiPermission: user._doc.apiPerms || 'basic',
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



router.use( '/users/:id', async (req,res,next) => {
    
    const { id } = req.params;
    const res.locals.userdata = await DB.users.get(id);

    next();
    
 });

router.use( '/admin/:id', async (req,res,next) => {
    
    const { id } = req.params;
    const res.locals.serverdata = await DB.servers.get(id);

    next();
    
 });

router.use( '/items/:id', async (req,res,next) => {
    
    const { id } = req.params;
    const res.locals.itemdata = await DB.items.get(id);

    next();
    
 });

router.use( '/cosmetics', async (req,res,next) => {
     
    
 });

 