const fx = require('./globalFunctions.js');
// const gear = require('../../core/gearbox.js');

// const DB = require('../database')
const VARS = require('./vars.js');
const fs = require('fs');

module.exports={
  dash: async function(req ,res,next){
  

    //await bot.ready; 
    console.log(req.user.id," USER ID")
    
    // Collect Database Info
    let dbpars = await fx.userDatabaseInfo(req.user.id,req);

    //Collect User Info
    let USR = req.user
    let UDB = dbpars || (await DB.users.findOne({id:USR.id}));

    let guilds = USR.guilds
    let gs = guilds.length

    //Generate Per-Server Information
    let ginfo = []
    for (i = 0; i < gs; ++i) {
      //SETUP
      let g = guilds[i]
      let GDATA= await DB.serverDB.findOne({id:g.id});
      let avi = "http://t5.rbxcdn.com/6f511c48046c3583b6ad0c1e65321c82"
      let perms = "noinfo"
      let ind = 10
      let hasPollux = false

      //Checks
      if (g.icon != null) avi = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`;
      if( GDATA )hasPollux = true;

      try {

        if ((GDATA.meta.adms||[]).includes(req.user.id)) {
          perms = "adm"
          ind = 1
        } else {
          perms = "commoner"
          ind = 3
        }
      } catch (e) {

        perms = "error"
        ind = "error"
      }
      if (g.owner) {
        ind = 0
        perms = "owner";
      };      
      let nme = g.name
      ginfo.push({
        icon: avi,
        name: nme,
        perms: perms,
        present: hasPollux,
        ind: ind,
        id: g.id
      })
     }

    ginfo.sort(compare)
    function compare(a, b) {
      return a.ind - b.ind
    }

    USR = fx.userBasics(req.user)
    dbpars = UDB
    
    let expR = await DB.users.find({"progression.exp": { "$gt" : UDB.progression.exp}}).countDocuments();
    let rubR = await DB.users.find({"currency.RBN": { "$gt" : UDB.currency.RBN}}).countDocuments();
    
      let MEDALBASE = await DB.cosmetics.find({type:'medal'});
      let BGBASE = await DB.cosmetics.bgs();
    let wife_metadata = await DB.users.find({id:{$in:UDB.married.map(wife=>wife.id)}});
 
    let payload = {
      title: "Dashboard",
      user: dbpars,
      userinfo: USR,
      usershit:req.user,
      wife_metadata,
      gear:gear,
      guilds: ginfo,
      ITEMBASE: (await DB.items.getAll()),
      MEDALBASE ,
      STICKERBASE: (await DB.cosmetics.find({type:"sticker"})),
      BGBASE ,
      expR:expR,
      rubR:rubR
    }

     res.render("newdash",payload);


},
  admin:async function (req, res) {
    let dbpars = await DB.serverDB.findOne({id:req.params.id});
    //console.log(dbpars  )
    if(!dbpars.meta) return res.send("Server not found (Try interacting with Pollux at least once in there!)");
    let theG = dbpars.meta||{}
    if (!dbpars) {
      return "ERROR";
    }
    let USR = fx.userBasics(req.user)
    delete require.cache[require.resolve('./serveradmin.js')];
    require('../pipelines/serveradmin.js/index.js').run(req, res, dbpars,theG,USR).then(status => res.send(status))
  },
  

  api: async function(req ,res,next){
        
      
      
      
    console.log("API inbound".red)
    const auth = req.query.authorization; 
    const act = req.params.action;
    console.log(act)
    const payload = req.query;
    
    let endpoint = act
    let target = req.params.tg ||null;
    let subtarget = req.params.stg ||null;
    let grain = req.params.sstg ||null;
    
    if(endpoint === 'user') {

      Promise.all([
          DB.users.findOne({id:target}),
          DB.userInventory.get(target),
      ]).then( async ([USR, cosmeticsData])=>{
        if(!USR) return res.send("USER ID NOT FOUND");

        let lranks =[]
        let uSvs =[]
        if(req.query.localranks){

         lranks = await DB.localranks.find({user:USR.id},{_id:0});
         uSvs = await DB.serverDB.find({id:{$in:lranks.map(x=>x.server)}},{_id:0,id:1,'meta.name':1});
        }

        let respayload = {
          id: USR.id,
          tag: USR.meta.tag
          ,avatar: USR.meta.avatar
          ,exp: USR.progression.exp
          ,level: USR.progression.level
          ,rubines: USR.currency.RBN
          ,jades: USR.currency.JDE
          ,sapphires: USR.currency.SPH
          ,is_donator: USR.prime?.tier && USR.prime.tier != ""
          ,donator_tier: USR.prime?.tier
          ,is_blacklisted: USR.blacklisted && USR.blacklisted != ""?true:false
          ,profile:{
            background: USR.profile.bgID
            ,featured_sticker: USR.profile.sticker
            ,color: USR.profile.favcolor
            ,flair: USR.profile.flairTop
            ,about: USR.profile.persotext
            ,tagline: USR.profile.tagline
            ,medals: USR.profile.medals
          } 
          
          ,inventory_size: cosmeticsData?.inventory?.length || 0
          
          
          ,localranks: lranks.length>0
          ?lranks.map(sv=>{return { name:uSvs.find(x=>x.id==sv.server).meta.name,id:sv.server,level:sv.level,exp:sv.exp,thx:sv.thx }})
          :undefined
        }
        if(subtarget && respayload[subtarget]){
           return res.json(respayload[subtarget]);
        }
        return res.json(respayload);
      });
      return;
    };
    
    if(endpoint === 'server') {
       return DB.serverDB.findOne({id:target}).then( async SVR=>{
        if(!SVR) return res.send("SERVER ID NOT FOUND");
        let respayload={
          id:SVR.id
          ,name: SVR.meta.name
          ,icon: SVR.meta.icon
          ,language:SVR.modules.LANGUAGE
          ,prefix:SVR.modules.PREFIX
          ,global_prefix:SVR.globalPrefix
        }
         if(subtarget && respayload[subtarget]){
           return res.json(respayload[subtarget]);
        }
        return res.json(respayload);
       })
    };

    if(endpoint === 'localrank') {};
    
    if(endpoint === 'cosmetics') {
      let querystring 
      if(!target) querystring = {};
      if(target && !subtarget) querystring = {type:target == "all" ? {$exists:true} : {$in:[target,target+"s"]}};
      if(target && subtarget) querystring = {type: target == "all" ? {$exists:true} : {$in:[target,target+"s"]}  , $or:[{id:subtarget},{code:subtarget},{icon:subtarget}]}
      
      return DB.cosmetics.findOne(querystring,{_id:0}).then( async COS=>{
        
      
        if(!COS || !([COS.id,COS.code,COS.icon].includes(subtarget))) {
          
       
            return DB.cosmetics.find(querystring,{_id:0,code:1,icon:1,id:1,type:1,name:1,rarity:1}).then(cos2=>{
                let response = cos2.map(x=> x);
                res.json(response);
            })
         };           
         res.json(COS);           
       })        
    };
    if(endpoint === 'inventory') {
      let querytring 
        if(!subtarget) res.sendCode(400);
        if(!target) res.sendCode(400);
        DB.userInventory.get(subtarget).then(async udata=>{

          if(target == "bgs") querystring = {type:'background' ,code:{$in:udata?.bgInventory||[]}} ;
          if(target == "medals") querystring = {type:'medal' ,icon:{$in:udata?.medalInventory||[]}} ;
          if(target == "stickers") querystring = {type:'sticker' ,id:{$in:udata?.stickerInventory||[]}} ;
          if(target == "flairs") querystring = {type:'flair' ,id:{$in:udata?.flairInventory||[]}} ;
          if(target == "items") querystring = {id:{$in:(udata?.inventory||[]).map(i=>i.id)}};

          await DB.cosmetics.find(querystring,{_id:0,code:1,icon:1,id:1,type:1,name:1,rarity:1}).then(cos3=>{
            let response = cos3.map(x=> x);
                res.json(response);
          })
        })
    }
    
    if(endpoint === 'item') {};
    
    if(!endpoint ) return res.sendStatus(400);     
    
    
    
    
    console.log(payload)
    QRY = typeof payload.query == 'string' ? JSON.parse(payload.query) : payload.query;

    
    try{ 
    if(act=='grab'){        
      DB[payload.lib].find(QRY||{}).then(response=>{
        res.json(response)
      })
    }
    if(act=='insert'){        
      DB[payload.lib].update(payload.targetq,QRY).then(response=>{
        res.send(200)
      })
    }
    }catch(e){
      console.log(e) 
      res.json(e)
    }
      
    
    
  }

  
}