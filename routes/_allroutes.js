
const express = require('express')
const router = express.Router()

const fx = require('../pipelines/globalFunctions.js');


// TECHNICAL  
  router.get('/redir', (q,r)=>r.render("callback"));
  router.get('/setup/:serverid' , checkAuth, (...args)=> simplepages('serverSetup').run(...args) );  


// MARKET  
  router.use('/shop', (...args)=>{
    delete require.cache[require.resolve('./shops')];
    const shop = require('./shops');
    return shop(...args);
  });


// EVENTS  
  router.use('/events', (...args)=>{
    delete require.cache[require.resolve('./events')];
    const events = require('./events');
    return events(...args);
  });


// GENERATORS  
  router.use('/generators', (...args)=>{
    delete require.cache[require.resolve('./generators')];
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

  

// COMMANDS
  router.get(['/commands','/commandlist','/cmd'], async  (req,res)=> {
    let cm = fx.cmsSetup(req); 
    res.render('commands/cmdlist', {cm})
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
  delete require.cache[require.resolve('./admin')];
  const whs = require('./admin');
  return whs(...args);
});

  router.post('/test', (req,res,nex)=> {
    console.log(req.body)
    res.sendStatus(200)
  } );

  // STATUSPAGE  
  router.use('/status', (...args)=>{    
    delete require.cache[require.resolve('./status')];
    const status = require('./status');
    return status(...args);
  });
  
  
  const request = require('request')
  router.get("/proxy/:url" , async (req,res) => {
      request(decodeURIComponent(req.params.url)).pipe(res)
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
  
  
  router.get('/invite', function (req, res) {
    //req.logout();
    res.redirect('https://discordapp.com/api/oauth2/authorize?client_id=354285599588483082&permissions=268492816&redirect_uri=https%3A%2F%2Fbeta.pollux.gg%2Fcallback&response_type=code&scope=bot%20identify%20guilds%20connections%20email');
  });

  

  module.exports = router;
