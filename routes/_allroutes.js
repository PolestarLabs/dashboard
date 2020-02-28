
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
  delete require.cache[require.resolve('./api')];
  const api = require('./api');
  return api(...args);
});


// DASHBOARD  
router.use(['/dashboard','/dash'], (...args)=>{
  delete require.cache[require.resolve('./dashboard')];
  const dash = require('./dashboard');
  return dash(...args);
});

// DASHBOARD  
router.use(['/embeds','/embedvisualizer','/embedarchitect','/embed-architect'], (req,res)=>{
  res.render('tools/embedvis')
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
  
  
  router.get('/invite', function (req, res) {
    //req.logout();
    res.redirect('https://discordapp.com/api/oauth2/authorize?client_id=354285599588483082&permissions=268492816&redirect_uri=https%3A%2F%2Fbeta.pollux.gg%2Fcallback&response_type=code&scope=bot%20identify%20guilds%20connections%20email');
  });


  module.exports = router;
return;
app=router;

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
  
  app.get('/google78c0ff1e25e0f4d3.html', (q,r)=>r.sendFile(__dirname+"/google78c0ff1e25e0f4d3.html"));
  app.get('/support', async function (req, res) {
    res.redirect("http://discord.gg/rEBCccS")
  })
  app.get('/partners', (...args)=> simplepages().partners(...args) );
  app.get('/partners/apply', checkAuth,  (...args)=> simplepages().applyptn(...args) );

  app.get('/undefined', async function (req, res) {
    res.send(200)
  })
  app.get('/getcanvas', (...args)=> simplepages().getcanvas(...args));

  //app.get('/commands', (...args)=> simplepages().commands(...args));
  app.post('/money', (...args)=> simplepages().money(...args));

  app.get('/dashboard',checkAuth, (...args)=> complexpages().dash(...args));
  app.get('/stickers', (...args)=> simplepages().stickers(...args));
  app.get('/boosterpacks', (...args)=> simplepages().stickers(...args));
  
  app.get('/leaderboards', (...args)=> simplepages().rank(...args));
  app.post('/rk', (...args)=> simplepages().rank2(...args));
  app.post('/userinfo', (...args)=> simplepages().usinf(...args));

  app.get('/webdaily', checkAuth,(...args)=> simplepages().daily(...args));

  app.get('/fanart', (...args)=> simplepages().art(...args));
  app.get('/artwork', (req,res,next)=> res.redirect('/fanart'));
  app.get('/cpanel',checkAuth, (...args)=> simplepages().cpanel(...args));
  app.get('/discord',checkAuth, (...args)=> simplepages().discord(...args));
  app.get('/gear/:id', (...args)=> simplepages().somegear(...args));

  app.get('/medalshop', (...args)=> simplepages().medalshop(...args));
  app.get('/bgshop', (...args)=>  res.redirect("/shop/backgrounds"));
  app.get('/crafting', (...args)=> simplepages().crafting(...args));
  app.get('/overclock', (...args)=> simplepages().overclock(...args));
  app.get('/status', (...args)=> simplepages().statuspage(...args));
  app.get('/status/check', (...args)=> simplepages().statuscheck(...args));

  app.get('/partners/:handle/bgshop', (...args)=> simplepages().custombgshop(...args));
  app.get('/partners/:handle/medalshop', (...args)=> simplepages().custommedalshop(...args));
  app.get('/partners/:handle/:pagetype/:page', checkAuth, (...args)=> simplepages().custombgshopPage(...args));
  app.get('/partners/:handle/:whatever/:pagetype/:page', checkAuth, (...args)=> simplepages().custombgshopPage(...args));

  app.get('/api/:action/:tg/:stg/:sstg', (...args)=> complexpages().api(...args));
  app.get('/api/:action/:tg/:stg', (...args)=> complexpages().api(...args));
  app.get('/api/:action/:tg', (...args)=> complexpages().api(...args));
  app.get('/api/:action', (...args)=> complexpages().api(...args));

  app.get('/info', (...args)=> simplepages().info(...args));
  app.get('/profile/:id', (...args)=> simplepages().public_profile(...args));
  app.get('/p/:id', (...args)=> simplepages().public_profile(...args));
  app.get('/exprofile/:id', (...args)=> simplepages().apublic_profile_ex(...args));
  app.get('/ranks/:id', (...args)=> simplepages().locranks(...args));

  app.get('/audits/:id', (...args)=> simplepages().audits(...args));
  app.post('/commitProfile', checkAuth,  (...args)=> simplepages().commiprofile(...args) );
  app.post('/tooltip', checkAuth,  (...args)=> simplepages().tooltip(...args) );

  app.post('/paramsave', checkAuth,  (...args)=> simplepages().paramsave(...args) );
  app.get('/piece/:id', checkAuth,  (...args)=> simplepages().pieces(...args) );
//---------VANILLA-------------------------------------------------//
  app.get('/dev/:page', async (req, res, next)=>{
    delete require.cache[require.resolve('./routes/devoperations.js')];
    require('./routes/devoperations.js').run(req,res,checkAuth).then(status=>res.send(status))
  });    

  app.post('/equip/:type/:item',async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.send(403);
    delete require.cache[require.resolve('./routes/operations.js')];
    require('./routes/operations.js').equip(req).then(status=>res.send(status))
  });
  app.post('/process/:action', async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.send(403);
    delete require.cache[require.resolve('./routes/operations.js')];
    require('./routes/operations.js')[req.params.action](req,res).then(status=>res.send(status))
  });
  app.post('/buy/:item', async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.send(403);
    let payload= {}
    payload.type = req.body.type
    payload.currency = req.body.currency
    payload.user = req.user
    payload.item = req.params.item
    delete require.cache[require.resolve('./routes/operations.js')];
    require('./routes/operations.js').buy(payload,req.body).then(status=>res.send(status)) 
  });
  app.post('/craft', async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.send(403);
    delete require.cache[require.resolve('./routes/webcraft.js')];
    require('./routes/webcraft.js').run(req.body.item,req.body.checking,req,res).then(status=>status) 
  });



  app.get('/bgs_page/:page',async function (req, res, next){

    let BGBASE= (await DB.cosmetics.bgs()).filter(bg=>!bg.event);
    let tags=req.query.tags?req.query.tags.split(' '):[];

    let intersection = BGBASE.filter(bkg=>{
      let rari=true, tagi=true, evi=true;
      
      if (req.query.rarity&&'CURSR'.includes(req.query.rarity)){
        rari = bkg.rarity==req.query.rarity ? true : false;
      }
      if (tags.length>0){
        tags.forEach(tag=>{
          if(!bkg.tags.includes(tag)) tagi = false;
        });
      }
      if(req.query.event){
      //  evi = bkg.event ? true : false;
      }     
      return rari && tagi && evi;      
    })

    let max = req.query.max || 50;
    let total = intersection.length
    let pages = Math.ceil(total/max);
    let C = Number(req.params.page);
    if(C>pages)C=pages;

    let elpis_nex = pages-5>0 && C<pages-2
    let elpis_prv = pages-5>0 && C>1

    let L = pages 
    let F = 1
    let P = C-1
    let N = C+1

    let pageArray = intersection.slice((C-1)*25,C*25)

      let fullquery= `?${req.query.tags?"tags="+req.query.tags:""}${req.query.rarity?"&rarity="+req.query.rarity:""}${req.query.event?"&event="+req.query.event:""}${req.query.max?"&max="+req.query.max:""}`
      
    if(req.query.json=="true"){
    res.json({F,elpis_prv,P,C,N,elpis_nex,L,content: pageArray,intersection,stata:{
      x:req.query.rarity!=undefined,
y:tags.length>0
    }})
    }else{ 
      
      

      let userdata = false;
      if (req.user){
        userdata =  await DB.userDB.findOne({id:(req.user||{id:'0'}).id});
      }

      
    res.render('shop/bgs',{userdata,F,elpis_prv,P,C,N,elpis_nex,L,intersection,
                               fullquery,
                               max
                               ,query:req.query
                              })
    }

  });
  app.get('/bgs',async function (req, res, next){

    let BGBASE= (await DB.cosmetics.bgs()).filter(bg=>!bg.event);
    let tags=req.query.tags?req.query.tags.split(' '):[];



    let intersection = BGBASE.filter(bkg=>{
      let rari=true, tagi=true, evi=true;
      
      if (req.query.rarity&&['CURSR'].includes(req.query.rarity)){
        rari = bkg.rarity==req.query.rarity ? true : false;
      }
      if (tags.length>0){
        tags.forEach(tag=>{
          if(!bkg.tags.includes(tag)) tagi = false;
        });
      }
      if(req.query.event){
      //  evi = bkg.event ? true : false;
      }
      

      return rari && tagi && evi;
      
    })


    let max = req.query.max || 50;
    let total = intersection.length

    let pages = Math.ceil(total/max)


    let C = Number(req.query.page||1);

    if(C>pages)C=pages;

    let elpis_nex = pages-5>0 && C<pages-2
    let elpis_prv = pages-5>0 && C>1

    let L = pages 
    let F = 1
    let P = C-1
    let N = C+1

    let fullquery= `?${req.query.tags?"tags="+req.query.tags:""}${req.query.rarity?"&rarity="+req.query.rarity:""}${req.query.event?"&event="+req.query.event:""}${req.query.max?"&max="+req.query.max:""}`


    let pageArray = intersection.slice((C-1)*25,C*25)

    intersection=BGBASE.filter(bg=>intersection.includes(bg.code))
      for(i=0;i<BGBASE.length;i++){
      if(!arrayTags.includes(BGBASE[i].code))intersection.push(BGBASE[i]);
    }
      intersection=intersection.map(bg=>{bg.tags=TAGS[bg.code]||'';return bg})

    if(req.query.json=="true"){
    res.json({F,elpis_prv,P,C,N,elpis_nex,L,content: pageArray})

    }else{ 
    res.render('bgsdev-piece',{F,elpis_prv,P,C,N,elpis_nex,L,intersection,
                               fullquery,
                               max,TAGS
                               ,query:req.query
                              })
    }

  })    
//-----------------------------------------------------------------//
//-----------------------------------------------------------------//
//-----------------------------------------------------------------//

  let pageMedLoad = async function (req, res, next){
      let userdata = false;
      if (req.user){
        userdata =  await DB.userDB.findOne({id:(req.user||{id:'0'}).id});
      }
    

    
    let MEDALBASE= (await DB.cosmetics.medals()).filter(md=>{
      if (md.event) return false;
      if ( userdata && userdata.modules.medalInventory.includes(md.icon)) return false;
      return true;
    }).reverse();
    let tags=req.query.tags?req.query.tags.split(' '):[];
    
    let intersection = MEDALBASE.filter(medal=>{
      let rari=true, tagi=true, evi=true;      
      if (req.query.rarity&&'CURSR'.includes(req.query.rarity)){
        rari = medal.rarity==req.query.rarity ? true : false;
      }
      if (tags.length>0){
        tags.forEach(tag=>{
          if(!medal.tags.includes(tag)) tagi = false;
        });
      }
      if(req.query.event){
      //  evi = medal.event ? true : false;
      }     
      return rari && tagi && evi;      
    })

    let max = req.query.max || 120;
    let total = intersection.length
    let pages = Math.ceil(total/max)
    let C = Number(req.params.page||1);
    if(C>pages)C=pages;
    let elpis_nex = pages-5>0 && C<pages-2
    let elpis_prv = pages-5>0 && C>1
    let L = pages 
    let F = 1
    let P = C-1
    let N = C+1
    let pageArray = intersection.slice((C-1)*25,C*25)

      let fullquery= `?${req.query.tags?"tags="+req.query.tags:""}${req.query.rarity?"&rarity="+req.query.rarity:""}${req.query.event?"&event="+req.query.event:""}${req.query.max?"&max="+req.query.max:""}`

    if(req.query.json=="true"){
    res.json({F,elpis_prv,P,C,N,elpis_nex,L,content: pageArray,intersection,stata:{
      x:req.query.rarity!=undefined,
y:tags.length>0
    }})

    }else{ 


    res.render('shop/mds',{userdata,gear,F,elpis_prv,P,C,N,elpis_nex,L,intersection,
                               fullquery,
                               max
                               ,query:req.query
                              })
    }

  };

  app.get('/medals_page/:page',pageMedLoad);
  app.get('/medals_page',pageMedLoad);
//-----------------------------------------------------------------//
//-----------------------------------------------------------------//
//-----------------------------------------------------------------//



  app.get('/admin/:id', checkAuth,  (...args)=> complexpages().admin(...args));



  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  
  
  app.get('/events', async function (req, res) {
    
    let u = fx.userBasics(req.user)
    res.render('events', {
      title: 'Events',
      userinfo: fx.userBasics(req.user),
      userdata: await DB.userDB.findOne({id:(req.user||{id:0}).id})
    });
  });
  
  app.get('/events/:id', async function (req, res) {
    let u = fx.userBasics(req.user)

    
    res.render('events/'+req.params.id, {
      userinfo: fx.userBasics(req.user),
      buyables: await DB.buyables.find({}),
      userdata: await DB.userDB.findOne({id:(req.user||{id:0}).id}),
      thx: await DB.userDB.find({id:{$in:[
        "132022438040043520"
        ,"102165107244539904"
        ,"103727554644418560"
        ,"174622753666629632"
        ,"359925352061075468"
        ,"163200584189476865"
        ,"250764795207352322"
        ,"459261674998988811"
        ,"155323155735511041"
        ,"146631978018406400"
        ,"180653744466296833"
        ,"281629327551102988"
        ,"411728912968581141"        
        ,"203139018760781824"        
      ]}},{meta:1,id:1})
    });
  });
