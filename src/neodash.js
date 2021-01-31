global.HOST = "https://beta.pollux.gg" 
global.appRoot = "/home/pollux/polaris"
global.Promise = require('bluebird')
Promise.config({
  longStackTraces: true
})

const memCache = require('memory-cache');
global.cacheFunction = (duration) => {
  return (req, res, next) => {
    res.set('Cache-control', 'public, max-age='+duration);
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = memCache.get(key)
    if (cachedBody) {
      res.json(typeof cachedBody == 'string' ? JSON.parse(cachedBody) : cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        memCache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}
global.userCache = new Map();

const config = require('../config.js');


global.hasPolluxRole = function hasPolluxRole(req,roleID){
  return new Promise(async resolve=>{     
      try{
          SVID = "277391723322408960"
          let [memberInfo,serverData] = await Promise.all([
              PLX.getRESTGuildMember(SVID, req.user.id),
              DB.servers.get(SVID)
          ]);
          if(memberInfo.roles.includes(serverData.modules.MODROLE)) return resolve(true);
          resolve( memberInfo.roles.includes(roleID) );
      }catch(err){
          console.error(err);
          resolve (false);
      }
  })  
}
global.compulsoryAuth = async function checkAuthTwo(req, res, next) {
  try{

    if (req.isAuthenticated()){
      if(req.user.guilds.find(g=>g.id==='363476237118734349')){
        return next();
      }else{
        return auth(req,res,next);
      }
    }else{    
      return auth(req,res,next);   
    }  
  }catch(err){
    console.error(err);
    return false;
  }
};
global.MARKET_TOKEN = config["pollux-api-token"]


const Express = require('express');
const Passport = require("passport");
const PassportRefresh = require('passport-oauth2-refresh');
const CookieStrategy = require("passport-cookie");
const {Strategy} = require("passport-discord");
const exSession = require("express-session");
const Eris = require ('eris')

const fs = require("fs");
const path = require('path');
const logger = require('morgan');

const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');


const formidable = require('formidable');


const app = Express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Origin', 'https://dev.pagseguro.uol.com.br');
    res.header('Access-Control-Allow-Origin', 'https://pagseguro.uol.com.br');
    res.header('Access-Control-Allow-Origin', 'https://api.pollux.fun');
    res.header('Access-Control-Allow-Origin', 'https://pollux.fun');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    next();
});
app.use(bodyParser.json({
  verify: (req, res, buffer) => { req.rawBody = buffer }
}));

// ========================================================================================================
const webhook = (obj) => {
  const string = typeof obj === 'string' ? obj : require('util').inspect(obj);
  const array = string.match(/[\s\S]{1,1950}([\n\r]|$)/g);
  return Promise.all(array.map((s) => PLX.executeWebhook('776142548263632986', 'iU3SCHB22I2-NCVrpRaGZE7H2vs8HFJfjugsBTg4ltX7KzxFOO2u71U4ewKgL2g3OvfL', {
    content: '```js\n' + s + '\n```'
  })));
}
/*
const stripe = require('stripe')('sk_test_51HlCCKE9Tpa5TPNLkKRKC8vuce8Jrzg8Yj2pF1CPeL9ncTg6kPQfBXwRIFU1U6CG2DMn8fQuNYKKPbkC1oII7Bxs00bnvqi7BB')
app.post('/webhook/bsian-stripe', async (req, res) => {
  try {
    await webhook (req.body);
    await webhook(req.rawBody);
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody, req.headers['stripe-signature'], 'whsec_tgLhVyt7EwUiHYfJjO0ntoVnNXcqexlt'
      )
      await webhook(event);
    } catch (error) {
      console.log(error);
      await webhook(error);
      return res.sendStatus(400);
    }
    await webhook(event.data.object);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
})
*/
// =======================================================================================

const dbURL = 'mongodb://polaris:geminisbeta@138.201.158.163:27472/polaris';
const dbOptions = { 
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  keepAlive: 1,
  connectTimeoutMS: 30000,
}

global.PLX = new Eris.Client(config.token,{restMode:true});
Object.assign(PLX,require(process.env.BOT_PATH + '/core/utilities/Gearbox').Client);

(require('@polestar/database_schema'))({
  url: dbURL,
  options: dbOptions,
}).then(Connection => {
  global.DB  = Connection;
  app.listen( process.env.DASHPORT || 4728, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:'+((process.env.DASHPORT||4728) +"").blue )
  })
  
})

//-- SESSION STORAGE
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(exSession);

mongoose.connect( dbURL, dbOptions);


mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = require('bluebird');
Promise.promisifyAll(require("mongoose"));
Object.assign(global,require( process.env.BOT_PATH + '/core/utilities/Gearbox' ).Global)

//-- PASSPORT  
const scopes = ['identify', 'guilds','connections'];
Passport.serializeUser((user, done) => {
  done(null, user);
}); 
Passport.deserializeUser((obj, done) => {
  done(null, obj);
});

Passport.use(new CookieStrategy(
  function (token, done) {
    User.findByToken({
      token: token
    }, function (err, user) {
      if (err) return done(err);      
      if (!user)return done(null, false);      
      return done(null, user);
    });
  }
));

let discordStrategy = new Strategy({
  clientID: config.clientID,
  clientSecret: config.secret,
  authorizationURL: 'https://discordapp.com/api/oauth2/authorize?prompt=none',
  callbackURL: (process.env.NODE_ENV === 'production' ? HOST : 'https://136.243.78.7:4728/')+"/callback",
  scope: scopes,
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    profile.refreshToken = refreshToken;
    process.nextTick(function () {
    return done(null, profile);
  });
});
Passport.use(discordStrategy);
PassportRefresh.use(discordStrategy);

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  extended: true,
   parameterLimit:50000,
  limit: '50mb'
}));
app.use(xmlparser());
/*
app.use(sassMiddleware({
  src: path.join(__dirname, 'public/sass'),
  dest: path.join(__dirname, 'public/css'),
  indentedSyntax: true
  //indentedSyntax: false
  ,sourceMap: true,
  debug:false,
  prefix: '/css'
}));
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); 

const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";

app.use(Express.static(path.join(__dirname, './public')));
app.use(Express.static(path.join( ASSETS_PATH, './imgres')));
app.use(Express.static(path.join( ASSETS_PATH, './cosmetics')));
app.use("/images", Express.static(path.join(__dirname, './public/images')));
app.use("/images", Express.static(path.join( ASSETS_PATH, './website')));
app.use("/flairs",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));
app.use("/medals",    Express.static(path.join( ASSETS_PATH, './cosmetics/medals')));
app.use("/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/boosters",  Express.static(path.join( ASSETS_PATH, './build/boosters')));
app.use("/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build",     Express.static(path.join( ASSETS_PATH, './build')));
//backwards compat
app.use("/build/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/build/flairs/top",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));


app.use(exSession({
  secret: "giraigumo",
  maxAge: 13600000,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 3600000 /*hour*/ * 48 },
  rolling: true,
  resave: true,
  saveUninitialized: true
}));

app.use(Passport.initialize());
app.use(Passport.session());

//======================================================================
//              DASHBOARD
//======================================================================


app.get('/auth', Passport.authenticate('discord', {scope: scopes}), (req, res,nex)=> nex() )


app.get('/newserver', (...args) => simplepages().callback(...args));


app.get('/logout', function (req, res) {
  req.logout();
  if(req.query.r=='blacklisted') {
    res.locals.blacklisted = true;
    return res.redirect('/?bl=1');
  }
  res.redirect('/');
});  



global.simplepages   = function simplepages(location=false){
  delete require.cache[require.resolve('./routes/'+(location||"simplepages"))];    
  //delete require.cache[require.resolve('./routes/globalFunctions.js')];    
  return require(__dirname+'/routes/'+(location||"simplepages"));
};  
global.complexpages  = function complexpages(location=false){
  delete require.cache[require.resolve('./pipelines/'+(location||"/complexpages"))];    
  //delete require.cache[require.resolve('./routes/globalFunctions.js')];    
  return require(__dirname+'/pipelines/'+(location||"/complexpages")); 
};

/* FANCY LOGGING */
colors = require('colors')
logger.token('userID', function (req, res) { return req.user? req.user.id.blue : "-ANONYMOUS-".magenta })
logger.token('userTag', function (req, res) { return req.user? req.user.username+"#"+req.user.discriminator : "" })
logger.token('date', function(){  return new Date().toUTCString(); });
app.use(logger(function(tokens,req,res){
  let status = tokens.status(req,res);
  let STATUS = status >= 500 ? status.red : status >= 400 ? status.yellow : status >= 300 ? status.cyan : status >= 200 ? status.green : status;
  let METHOD = (M) => M=='POST'? " POST ".bgYellow : M=='GET' ? " GET  ".bgBlue : M.bgRed;
  return[
    //("["+tokens.date(req,res)+"]").grey.bgBlack.dim,"\n",
    METHOD(tokens.method(req,res)),
    (tokens.url(req,res)+"").padEnd(40)[tokens.method(req,res)=='POST'?'yellow':'reset'],
    STATUS+"",
    ("<< "+tokens.referrer(req,res)+"").replace(HOST,'').padEnd(20).grey.italic, "",
    ("("+tokens['response-time'](req, res)+ 'ms | '+tokens.res(req, res, 'content-length')+')').padEnd(24),
    (tokens.userID(req,res)+"").padEnd(20),
    (" "+tokens.userTag(req,res)+" ").inverse,
    "\n\n"
  ].join(' ')
}));



/* --------------- */
const i18n = require("./locales.js");
app.use(i18n({
  translationsPath:   process.env.LOCALES_PATH,
  defaultLang: "en",
  //  browserEnable :false,
  siteLangs: ["en", "cz", "es", "fr", "pt-br", "pt", "ru","jp","tr","ko","de","pl"],
  textsVarName: 'translation',
  paramLangName: "locale"
}));


const i18next = require('i18next');
const i18n_backend = require('i18next-node-fs-backend');
const backendOptions = {
    loadPath:  process.env.LOCALES_PATH+'/{{lng}}/{{ns}}.json',
    jsonIndent: 2
};
 
fs.readdir( process.env.LOCALES_PATH , (err,list) => {
  //console.log(list)
    i18next.use(i18n_backend).init({
        backend: backendOptions,
        lng: 'dev',
        fallbackLng: ["en", "dev"],
        fallbackToDefaultNS: true,
        fallbackOnNull: true,
        returnEmptyString: false,
        preload: list,
        load: 'currentOnly',
        ns: ['bot_strings', 'events', 'commands', 'website', 'items', 'translation'],
        defaultNS: 'bot_strings',
        fallbackNS: 'translation',
        interpolation: {
            escapeValue: false
        }
    }, (err, t) => {
        if (err) {
            //console.warn("• ".yellow, "Failed to Load Some Translations".yellow, "\n"+err.map(e=>e.path.gray).join('\n'))
        }
        //console.log("• ".green, "Translation Engine Loaded")

        global.i18n = i18next;
        global.$t = t     
    });
});



const AcquireDiscordPayload = (TOKEN,req) => {
  TOKEN = (TOKEN||{}).access_token||TOKEN
  if(!TOKEN) return;
  discordStrategy.userProfile(TOKEN, FUD => ( (FUD||{}).id && FUD.provider == 'discord') ? req.user = freshUserData : null )
}

const VARS = require("./pipelines/vars.js");
const authCacheExpiration = new Map();

app.use(async function(req,res,next){
  res.locals.EVENT=VARS.EVENT
  let preDataProcess = result=>{
    let USR = req.user;
    if(result.blacklisted) return res.redirect('/logout?r=blacklisted');
    res.locals.userdata = result;
    res.locals.userinfo= {
      pix: (result.meta||{}).avatar || `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
      name: `${USR.username}#${USR.discriminator}`,
      uname: USR.username,
      id: USR.id,
      discriminator: USR.discriminator,
      servers:USR.guilds||USR.servers
    }
  }

  if(req.isAuthenticated() && req.method == 'GET' && !req.url.includes('/api/') && !req.url.includes('/generators/')){
    
    let userCacheReload = authCacheExpiration.get(req.user.id);
    if( userCacheReload && userCacheReload.exp > Date.now() ) {
      preDataProcess(userCacheReload.data)
      return next();
    }


    AcquireDiscordPayload(req.user.accessToken,req)
    PassportRefresh.requestNewAccessToken('discord',req.user.refreshToken, r => AcquireDiscordPayload(r,req) );

    let preUserData = DB.users.get({id:req.user.id});

    preUserData.then(async data=>{
      if(!data) {
        let dscUser = userCache.get(req.user.id) || await PLX.getRESTUser(req.user.id).then(u=> userCache.set(u.id,u) && u );
        data = await DB.users.new(dscUser); 
      }
      authCacheExpiration.set(req.user.id,{data,exp: Date.now() + 10e3  })
      preDataProcess(data)
    });

    await preUserData;    
    return next();
  }else{
    res.locals.userdata=null;
    res.locals.userinfo=null;
    next();
  }  
})  

//###################################################################################
const simpleauth = require('basic-auth')
const admins = { polaris: { password: 'geminis472899' } }
 
// remove all this shit later
const auth = async function(req, res, next) {
  //return next();
  if(req.url.includes('api'))      return next();
  if(req.url.includes('.png'))      return next();
  if(req.url.includes('discoin'))      return next();
  if(req.url.includes('/discord'))      return next();
  if(req.url.includes('branding')) return next();
  if(req.url.includes('embedarchitect')) return next();
  if(req.url.includes('botbridge')) return next();
  if(req.url.includes('webhook'))   return next();
  if(req.url.includes('.jpg'))      return next();
  if(req.url.includes('piece'))     return next();
  if(req.url.includes('status'))    return next();
  if(req.url.includes('gif'))       return next();
  if(req.url.includes('?json'))     return next();
  if(req.url.includes('random'))     return next();
  if(req.url.includes('/admin/'))     return next();
  if(req.url.includes('/setup/'))     return next();
  if(req.url.endsWith('/faq'))     return next();
  if(req.url.endsWith('/terms'))     return next();
  if(req.url.endsWith('/terms'))     return next();
  if(req.url.includes('commands'))     return next();
  if(req.url.includes('cmlist'))     return next();
  if(req.url.endsWith('/bsave'))     return next();
  //if(req.url.endsWith('/invite'))     return next();
  if(req.url.includes('/auth'))     return next();

  
  //var user = simpleauth(req)

  if(!req.isAuthenticated()){

   //return  compulsoryAuth(req,res,next);
  }
  
  
  
     if( req.headers['user-agent'] === "Polaris Bot"){
       return next()
     }
  //if(!req.isAuthenticated() && !req.url.includes('/auth') && !req.url.includes('callback')) return res.status(302).redirect('/auth');
  //else if(req.url.includes('/auth')) return next();
  if(req.isAuthenticated()){
    if( !req.user.guilds.find(g=>g.id==='363476237118734349'))  return res.status(401).send("User not eligible for beta access");
  }else{
    if(!req.url.includes("call")) return res.redirect('/auth');
    else return next();
  }


  return next()
}

global.isAdmin = function isAdmin(req,svID){
  return new Promise(async resolve=>{
     
      try{
          SVID = req.query.serverID || req.params.serverID || svID
          let [memberInfo,roleInfo,serverInfo,serverData] = await Promise.all([
              PLX.getRESTGuildMember(SVID, req.user.id).catch(()=>null),
              PLX.getRESTGuildRoles(SVID).catch(()=>null),
              PLX.getRESTGuild(SVID).catch(()=>null),
              DB.servers.get(svID).catch(()=>null)
          ]);
           
          if(memberInfo.roles.includes(serverData.modules.MODROLE)) return resolve(true);
          resolve(roleInfo.some(role=> req.user.id === serverInfo.ownerID || memberInfo.roles.includes(role.id) && (role.permissions.has('manageGuild')||role.permissions.has('administrator')) ));
      }catch(err){
          
          resolve (false);
      }
  })  
}

global.checkAuth = function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  if(req.method === 'GET') return res.render('needlogin');
  else res.status(401).send("Nope")
};
//###################################################################################




//app.use(auth);

app.get('/', auth, (req,res,rex)=>  {
  if (req.query.ref) {
    let ref = req.query.ref;
    DB.serverDB.set(ref, {
        $inc: {
            'partnerDetails.refs': 1
        }
    });
  }

  if(res.headersSent) return;
  return res.render("index",{index:true,blacklisted:req.query.bl==1 });
});

app.post('/checklogin', checkAuth, function (req, res) {
    res.sendStatus(200);
});
   
app.post('/sendform', async function (req, res) {
  let form = new formidable.IncomingForm();
  delete require.cache[require.resolve('./pipelines/forms.js')];
  require('./pipelines/forms.js').run(req, res,form).then(status => res.send(status))
});
 
app.get('/test', (...args)=> simplepages().test(...args));
 
app.get('/callback', 
          Passport.authenticate('discord', {
            permissions: 268492822,
            failureRedirect: '/'
          }),
          (...args)=> simplepages().callback(...args));

  
app.use('/', auth, (...args)=>{
  delete require.cache[require.resolve('./routes/_allroutes')];
  const router = require('./routes/_allroutes');
  return router(...args);    
});
        
app.use('/die', (...args)=>{
  process.exit()
});
//require('./routes/allroutes').run(app);

//-------

//======================================================================
//              ALL SET
//======================================================================

 
// CATCH 404
app.use(function (req, res, next) {
  if(req.handled) return; 
  if (res.headersSent) return next(err);
  res.status(404).render('404'); 
});


// ERROR HANDLER
app.use(async function (err, req, res, next) {
  console.log("xxx",err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const md5= require('md5')
  errdesc= err.message.split(/[\n\r]/g).slice(-1).pop()+""
  errline= err.message.split(/[\n\r]/g)[0].split('/').slice(5).join(' > ');
  errorCode = md5(errdesc);
  console.log(" ERROR ".bgRed, (err.name+"").red, errdesc.yellow, errline,(`[${errorCode}]`.blue))
  await DB.globals.updateOne({'data.errors.id':{$ne:errorCode}},{$addToSet:{'data.errors': {id:errorCode }    }})
  let errorData = (await DB.globals.findOneAndUpdate({'data.errors.id':errorCode},
    {
      $inc:{'data.errors.$.occurrences':1},
      $set:{ 'data.errors.$.name': err.name, 'data.errors.$.description': errdesc, 'data.errors.$.file': errline.split(':')[0], 'data.errors.$.stack':err.stack
      }
    }
  )).data.errors.find(er=>er.id==errorCode);
  if (res.headersSent) return;
  console.log({errorData})
  res.render('error', { errorData }); 
})


process.on('unhandledRejection', function (reason, p) {

  console.log("Possibly Unhandled Rejection at: Promise \n".red, p, "\n\n reason: ".red, reason);
  process.exit(1)


});


module.exports = app
