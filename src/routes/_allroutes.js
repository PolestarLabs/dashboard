
const express = require('express')
const router = express.Router()
const axios = require('axios')

const fx = require('../pipelines/globalFunctions.js');


// TECHNICAL  


  router.get("/video/:gallery/:video", (req,res)=>{
    const {ogname,ogtitle,ogcolor} = req.query;
    return res.render("tools/video",{video: req.params.gallery+"/"+req.params.video})
  })

  router.get('/redir', (q,r)=>r.render("callback"));
  router.get('/setup/:serverid' , checkAuth, (...args)=> simplepages('serverSetup').run(...args) );  


// MARKET  
  router.use('/marketplace', ( r,res)=>{ res.redirect('/shop/marketplace') });

  router.use('/shop', (...args)=>{
    delete require.cache[require.resolve('./shops')];
    const shop = require('./shops');
    return shop(...args);
  });

  router.use('/godmode', ( req,res)=>{
    if (!req.user) return res.redirect('/auth');
    delete require.cache[require.resolve('./_godmode.js')];
    const gmode = require('./_godmode.js');
    return gmode(req,res);
  });


// EVENTS  
  router.use('/events', (...args)=>{
    delete require.cache[require.resolve('./events')];
    const events = require('./events');
    return events(...args);
  });


// GENERATORS  
  router.use('/generators', (...args)=>{
    //delete require.cache[require.resolve('./generators')];
    const gens = require('./generators');
    return gens(...args);
  });

// ACHIEVEMENTS  
  router.use('/achievements', (...args)=>{
    delete require.cache[require.resolve('./achievements')];
    const achievements = require('./achievements');
    return achievements(...args);
  });
// ACHIEVEMENTS  
  router.use(['/leaderboards','/ranks/global','/ranks','/top'], (...args)=>{
    delete require.cache[require.resolve('./leaderboards')];
    const leads = require('./leaderboards');
    return leads(...args);
  });

// BOTBRIDGE  
  router.use('/botbridge', (...args)=>{
    delete require.cache[require.resolve('./botbridge')];
    const bridge = require('./botbridge');
    return bridge(...args);
  });

  router.get('/discord', async  (r,res)=>  res.redirect('http://discord.gg/rEBCccS'));

// SEARCH & PAGINATE  
  router.get('/search/:endpoint/:page', async  (...args)=> simplepages('paginate').run(...args));
  router.post('/search/:endpoint/:page', async  (...args)=> simplepages('paginate').run(...args));
  

  // STANDALONES
  router.get('/faq', (q,r)=>r.render("standalone-pages/faq"));
  router.get('/privacy', (q,r)=>r.render("standalone-pages/privacy"));
  router.get('/terms', (q,r)=>r.render("standalone-pages/terms"));
  router.get('/dmca', (q,r)=>r.render("standalone-pages/dmca"));
  router.get('/branding', (q,r)=>r.render("standalone-pages/branding"));
  router.get('/info', (q,r)=>r.render("standalone-pages/info"));
  router.get('/stickers', async  (...args)=> simplepages('stickers').run(...args));


// API
router.use('/api', (...args)=>{
  delete require.cache[require.resolve('./api/_main.js')];
  const api = require('./api/_main.js');
  return api(...args);
});


// DASHBOARD  
router.use(['/dashboard','/dash'], (...args)=>{
  delete require.cache[require.resolve('./dashboard')];
  const dash = require('./dashboard');
  return dash(...args);
});

// EMBED  
router.use(['/embeds','/embedvisualizer','/embedarchitect','/embed-architect'], (req,res)=>{
  res.render('tools/embedvis')
});

// EMBED  
router.use(['/p','/profile','/user'], (...args)=>{
  delete require.cache[require.resolve('./profile')];
  const profile = require('./profile');
  return profile(...args);
});
let timed = {};
router.post(['/userinfo'], async (req,res)=>{
  let ID = req.user.id;
  if(!ID) return res.sendStatus(400);
    const cfIP = req.headers['cf-connecting-ip'];
    if (ID === "789898454427500576") {
    if (!timed[ID]) {
      PLX.createMessage("792176688070918194", `Not getting IP info for <@${ID}> (${cfIP}) as requested`);
      timed[ID] = setTimeout(() => delete timed[IP], 3600000);
    }
    return res.sendStatus(204);
  } // TODO Implement a way for users to update flags themselves - this user lives in Palestine (claimed) with an Israeli IP
    let info = (await axios.get("https://ipinfo.io/"+cfIP+"/json")).data;
    await DB.users.set(ID,{$set:{personal:info}}).catch(console.error).then(console.log);
    res.sendStatus(200);
});
router.get(['/userinfo'], async (req,res)=>{
    console.log(req.headers)
    res.json((req.headers));
});

  

// COMMANDS
  router.get(['/commands','/commandlist','/cmd'], async  (req,res)=> {
    let cm = fx.cmsSetup(req); 
    res.render('commands/cmdlist', {cm})
  });
  router.get(['/craft','/crafting','/workshop'], async  (req,res)=> {
    let cm = fx.cmsSetup(req); 

    const opengraph = {};
    opengraph.image =    `${HOST}/build/opengraph/crafting.png`
    opengraph.title =    "Crafting Workshop"
    opengraph.description =    `⚗ Mix and match items together to create new ones! 🧪`,
    opengraph.large = true

    res.render('shop/crafting/workshop',{opengraph});
  });
  router.post('/cmlist', (...args)=> simplepages().cmlist(...args));


// HOOKS  
router.use('/webhook', (...args)=>{
  delete require.cache[require.resolve('./webhooks')];
  const whs = require('./webhooks');
  return whs(...args);
});

// oembed
router.use('/oembed', (...args)=>{
  delete require.cache[require.resolve('./oembed')];
  const oembed = require('./oembed');
  return oembed(...args);
});

// ADMIN INTERFACE  
router.use('/admin',checkAuth, (...args)=>{
  delete require.cache[require.resolve('./admin/_main.js')];
  const adminPanel = require('./admin/_main.js');
  return adminPanel(...args);
});

  router.post('/test', (req,res,nex)=> {
    console.log(req.body);
   
    res.sendStatus(200)

  } );
  router.get('/testone', (req,res,nex)=> {
    console.log(req.body);
    //res.sendStatus(200)
    console.log( require('../structures/ProgressionManager.js') );
    res.render('standalone-pages/oembed-test')

  } );



  // STATUSPAGE  
  router.use('/status', (...args)=>{    
    delete require.cache[require.resolve('./status')];
    const status = require('./status');
    return status(...args);
  });
  
  
  const request = require('request')
  router.get("/proxy/:url" , async (req,res) => {
      request( `https://proxy.pollux.workers.dev?pollux_url=${decodeURIComponent(req.params.url)}`).pipe(res)
  })
  
  // PARTNERS
  router.use('/partners', (...args)=>{
    if(process.env.NODE_ENV != "production" )delete require.cache[require.resolve('./partners')];
    const partners = require('./partners');
    return partners(...args);
  });
  
  router.use('/random', (...args)=>{
    if(process.env.NODE_ENV != "production" ) delete require.cache[require.resolve('./random')];
    const random_image = require('./random');
    return random_image(...args);
  });
  
  router.use('/paypal', (...args)=>{
    if(process.env.NODE_ENV != "production" ) delete require.cache[require.resolve('./paypal')];
    const paypal = require('./paypal');
    return paypal(...args);
  });
  
  router.use('/fanart', (...args)=>{
    if(process.env.NODE_ENV != "production" ) delete require.cache[require.resolve('./fanart')];
    const fana = require('./fanart');
    return fana(...args);
  });

  router.use('/invite', (...args)=>{
    if(process.env.NODE_ENV != "production" ) delete require.cache[require.resolve('./invite')];
    const invite = require('./invite');
    return invite(...args);
  });
  
  
  
  

router.get("/error", async (req,res) => {
  return res.render('thiswillerror');
});

  

  module.exports = router;
