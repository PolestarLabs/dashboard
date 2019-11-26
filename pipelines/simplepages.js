const fx = require('./globalFunctions.js');
// const gear = {}//require('../../core/gearbox.js');
const ECO = ('../database/Economy')
// const DB = require('../database')

const VARS = require('./vars.js');
const $$$ = require('./money.js');
//delete require.cache[require.resolve('./globalFunctions.js')]
const fs = require('fs');
const Canvas = require("canvas");
const Pixly = require("pixel-util");

module.exports = { 

  index: function (req, res) {
    if (req.query.ref){
      let ref = req.query.ref;
      DB.serverDB.set(ref,{$inc:{'partnerDetails.refs':1}});
    }
    res.render("index")
  },
  
  callback: function (req, res, next) {
    let backURL = req.header('Referer') || '/';
    let ServerAdd = req.query.guild_id
//ESSE NAO FUNCIONA
    if(ServerAdd) {
        res.locals.validator = Date.now();
        res.redirect("/setup/"+ServerAdd+"?validator="+res.locals.validator);
    }

    try {
      res.render("callback", {redire: backURL});
    } catch (e) {
        console.log(e)      
    }
  },
    
  commands:function(req,res,next){
        let cm = fx.cmsSetup(req)
    res.render('cmdlist', {
      title: 'Command List',
      jason: cm.json,
      alias: cm.aliases,
      commands: cm.CMS
     
    });
    
   
  },
  
  info: function(req,res,next){
   //fx.shard.request('broadcast flat','this.guilds.get("277391723322408960").members.map(s=>{return //{tag:s.user.tag,id:s.id,avatar:s.user.avatarURL||s.user.defaultAvatarURL,displayName:s.displayName|//|s.user.username}})',function (x){
     //console.log(x)
      res.send("Nothing here but us chickens!")
      
      res.render('info', {
      title: 'Information',
     
      bot: x,
        fx,
      userdb: DB.userDB
    });
         
   // });
},
  
  cmlist:async function (req, res, next) {

    try {

      let cm = fx.cmsSetup(req)
      res.render('commandine', {
        title: 'Command List B',
        jason: cm.json,
        alias: cm.aliases,
        commands: cm.CMS,
      });
    } catch (e) {
      res.send("ERROR")
    }
  },
    
  medalshop:async function (req, res) {
    if(req.user && req.user.id=='a88120564400553984'){
            res.render("medshop", {
        ongoingEvent:"halloween18",
        data: DB.serverDB,
        gear,
        MEDALBASE: await DB.cosmetics.medals()
      });
    }
    
        res.render("medshopdev", {
               opengraph: {
        image: "https://www.pollux.fun/images/splashes/medalshop.png",
        large: true,
        title: "Medal Shop",
        description: "Customise your Profilecard with cute medals."
      },
        ongoingEvent:"halloween18",
        data: DB.serverDB,
        gear,
        MEDALBASE: await DB.cosmetics.medals()
      });
    },
  
  bgshop: async function(req,res){
      let user
        user = fx.userDatabaseInfo((req.user||{id:''}).id, req)

      let bgbas  = await DB.cosmetics.bgs();
      let updir = __dirname
      var rerities = ["UR", "SR", "R", "U", "C"]
      let imgbox = {}
      let TAGS = bgbas.map
      for (let i = 0; i < 5; ++i) {
        let RAR = rerities[i]
        imgbox[RAR] = bgbas.filter(bg => bg.buyable === true && bg.rarity == RAR)
          .map(bg => ["/backdrops/" + bg.code + ".png", bg.code])
      }
      
    if(req.user && req.user.id=="88120564400553984"){
        imgbox.EV = bgbas.filter(bg => bg.event == 'halloween18')
      
    }
    
      if (VARS.EVENT) {
        imgbox.EV = bgbas.filter(bg => bg.event == VARS.EVENT)
      }
      imgbox.PEV = bgbas.filter(bg => bg.event && bg.event != VARS.EVENT)
      let USR = req.user


      res.render('bgsdev', {
        title: 'Background Shop',
        imgboxe: imgbox,
        tags: TAGS,
        user: user,
        ongoingEvent: VARS.EVENT,
        BGBASE: bgbas,
        gear:gear,opengraph: {
        image: "https://www.pollux.fun/images/splashes/bgshop.png",
        large: true,
        title: "Background Shop",
        description: "Customise your Profilecard with an amazing background. More than 500 community-picked options to choose from!"
      },
      });
  },  
  
  
  
  
  
  
  
  
  
  
  stickers: async function (req,res) {
      
    let STICKERBASE = await DB.cosmetics.find({type:"sticker"});
    let BOOSTERS = await DB.items.find({type:"boosterpack"});
    
    
    
    res.render('stickers', {
      STICKERBASE,
      BOOSTERS,
      opengraph: {
        image: "https://www.pollux.fun/images/splashes/stickers.png",
        large: true,
        title: "Sticker Boosters",
        description: "Listing of Stickers on every series of Boosters"
      }
    })
    },
  
  
  
  
  
  statuspage: async function(req ,res){
    
    
    

res.render('stata3')

  },
  
  
  
  
  pieces:async function(req,res){
    
    
    //await bot.ready; 
    console.log(req.user.id," USER ID")
    
    // Collect Database Info
    let dbpars = await fx.userDatabaseInfo(req.user.id,req);

    //Collect User Info



    let guilds = req.user.guilds
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


    dbpars = req.app.locals.userdata
    let UDB = dbpars
    
    let expR = await DB.userDB.find({"modules.exp": { "$gt" : UDB.modules.exp}}).countDocuments();
    let rubR = await DB.userDB.find({"modules.rubines": { "$gt" : UDB.modules.rubines}}).countDocuments();
    
      let MEDALBASE = await DB.cosmetics.medals();
      let BGBASE = await DB.cosmetics.bgs();
    let wife_metadata = await DB.userDB.find({id:{$in:UDB.married.map(wife=>wife.id)}});
 
    let payload = {
      title: "Dashboard",
      user: dbpars,
      usershit:req.user,
      wife_metadata,
      bgInv: dbpars.modules.bgInventory,
      gear:gear,
      guilds: ginfo,
      ITEMBASE: (await DB.items.getAll()),
      MEDALBASE ,
      STICKERBASE: (await DB.cosmetics.stickers()),
      BGBASE ,
      expR:expR,
      rubR:rubR
    }
    
    let page = req.params.id
    
    res.render('dash/profile/'+page,payload)
    
    
    
    
  },
  
  tooltip: async function(req ,res){
    let user = req.body.user;
    let udata = await DB.userDB.findOne({id:user});
    res.render('tool',{udata})
    
  }, 
  crafting: async function(req,res){
      let user
      user = fx.userDatabaseInfo((req.user||{id:''}).id, req)
      let USR = req.user
          let items = await DB.items.getAll();
    
      res.render('shop/crafts', {
        title: 'Crafting',

        user: user,
  
        items,opengraph: {
        image: "https://www.pollux.fun/images/splashes/craft.png",
        large: true,
        title: "Crafting",
        description: "Spend your Jades Dust to create items!"
      },
      });
  },
  
  cpanel: async function (req, res) {
          let aytgi = ["88120564400553984","200044537270370313","163200584189476865","288495729088004096","250764795207352322"]
      if (!aytgi.includes(req.user.id)) return res.sendStatus(403);
      
          //let dbminiarray= await userDB.find({});
    //let dbminiarray2= await DB.find({});
      
      res.render("cpanel", {
        data: 1,
        udb: 1,
        gear: gear,
        eco: DB.ecoDB,

        MEDALBASE: (await DB.cosmetics.medals()),
        BGBASE: (await DB.cosmetics.bgs())
      });
    },
  
  rank: async function (req, res) {
      let dbminiarray = await DB.userDB.find({
        id: {
          $not: {
            $in: ["88120564400553984", "271394014358405121", "200044537270370313"]
          }
        },
        blacklisted:{
          $exists:false
        }
      }).sort({
        'modules.exp': -1
      }).limit(102);

      let rank = dbminiarray.map(rae => {
              
              return {
                id: rae.id,
                name: rae.tag || (rae.meta||{}).tag || (rae.name + "#" + (rae.discriminator||"????")),
                exp: rae.modules.exp,
                lv: rae.modules.level,
                rubine: rae.modules.rubines,
                avi: (rae.meta||{}).avatar 
              }

      });
      

      res.render("leaderboards", {
        data: DB.DB,
        eco: DB.ecoDB,
        rank: rank,
        udb: dbminiarray
      });
      //});
    },  
  rank2: async function (req, res) {
      let dbminiarray = await DB.userDB.find({
        id: {
          $not: {
            $in: ["88120564400553984", "271394014358405121", "200044537270370313"]
          }
        },
        blacklisted:{
          $exists:false
        }
      }).sort({
        'modules.exp': -1
      }).limit(102);

      let rank = dbminiarray.map(rae => {
              
              return {
                id: rae.id,
                name: rae.tag || (rae.meta||{}).tag || (rae.name + "#" + (rae.discriminator||"????")),
                exp: rae.modules.exp,
                lv: rae.modules.level,
                rubine: rae.modules.rubines,
                avi: (rae.meta||{}).avatar 
              }

      });
      

      res.render("rk", {
        data: DB.DB,
        eco: DB.ecoDB,
        rank: rank,
        udb: dbminiarray
      });
      //});
    },
    
  public_profile: async function (req, res) {
    
          //if(!req.user || !['88120564400553984','132022438040043520','200044537270370313','163200584189476865'].includes(req.user.id))return 403;
          if (req.params.id=='me' && !req.user) return res.render('needlogin');
        //console.log(req.params.id)
          let UDB = await DB.userDB.findOne({
            id: req.params.id
          })||await DB.userDB.findOne({
            personalhandle: req.params.id
          });
    
        if (req.params.id == 'me' ) UDB=await DB.userDB.findOne({id: req.user.id});
    
        if(UDB&&UDB.personalhandle&&req.params.id!=UDB.personalhandle){
          return res.redirect('/profile/'+UDB.personalhandle);
        }
          if (!UDB) { console.error(`UNREGISTRED USER: ${req.user.id}`); res.sendStatus(404)}
          let USID = UDB.id;

          let USR = req.user

          USR = fx.userBasics(req.user)
          
          if (!UDB) {
            res.render("public/noprofile");
          } else {
            let expR = DB.userDB.find({
              "modules.exp": {
                "$gt": UDB.modules.exp
              }
            }).countDocuments();
            let rubR = DB.userDB.find({
              "modules.rubines": {
                "$gt": UDB.modules.rubines
              }
            }).countDocuments();

            
            let wife_metadata = await DB.userDB.find({id:{$in:UDB.married.map(wife=>wife.id)}});
            //console.log(wife_metadata)
            let payload = {
              opengraph:{
                color:UDB.modules.favcolor,
                image:"https://www.pollux.fun/getcanvas?profile="+UDB.id,
                large:true,
                title:UDB.meta.tag+"'s Profile",
                description:"["+UDB.modules.tagline+"] | "+UDB.modules.persotext
              },
              wife_metadata,
              title: UDB.name+"'s Profile",
              user: UDB,
              userinfo: USR,
              gear: gear,
              STICKERBASE: (await DB.cosmetics.find({type:'sticker'})),
              MEDALBASE: (await DB.cosmetics.medals()),
              BGBASE: (await DB.cosmetics.bgs()),
              expR: expR,
              rubR: rubR,
              me: req.user && (req.params.id=="me"|| (req.user.id && req.params.id==req.user.id) || (req.params.id==UDB.personalhandle && UDB.id == req.user.id))

            }
                 res.render("public/pubprof",payload);

          }
  },


  
  getcanvas: async function(req,res){
    
    async function getCanvas(path) {
    
      let img = await new Canvas.Image;
      img.src = await Pixly.createBuffer(path).then(buff => {
        return buff;
      });
      return img;
    }
    
    const CANVAS= new Canvas.createCanvas(450,150);
    const ctx = CANVAS.getContext('2d')
    const query = req.query
    
    if (query.profile){
      let UID = query.profile;
      let userdata = await DB.userDB.findOne({id:UID});
      let backg = userdata.modules.bgID + ".png";
      let img_backg = await getCanvas("https://pollux.fun/backdrops/"+backg);
      let avi = await getCanvas(userdata.meta.avatar);
      ctx.drawImage(img_backg,150,0,300,154);
      let grd = ctx.createLinearGradient(0, 0, 0, 180);
      grd.addColorStop(.5, "#0000");
      grd.addColorStop(.8, "#2b2b3bbb");
      ctx.fillStyle = grd;
      //ctx.fillRect(0, 0, 450, 150);
      ctx.drawImage(avi,0,0,150,150);

      for (i=0;i<userdata.modules.medals.length;i++){
        if(userdata.modules.medals[i] != 0){          
          let md = userdata.modules.medals[i] + ".png";
          console.log(md)
          let tempmed = await getCanvas("https://pollux.fun/medals/"+md);
          ctx.drawImage(tempmed,155+(32*i),115,32,32);
        }
      }

      
    }
    
    
    let result = await CANVAS.toBuffer();
    res.writeHead(200, {
     'Content-Type': 'image/png',
     'Content-Length': result.length
    });
    res.end(result);
  },
  
  
  
  
  
  
  
  paramsave: async function (req, res) {

      VARS.respack.s="error"

    try {
      let action = req.body.action
      let scope = req.body.scope
      let target = req.body.target=="self" ? req.user.id :req.body.target
      if      (scope == "user")    scope = DB.userDB;
      else if (scope == "server")  scope = DB.serverDB;
      else if (scope == "channel") scope = DB.channelDB;
      else{
        respack.m="Scope not Specified";
        //console.log("NO SCOPE")
        return res.send(respack);
      }
      if (action != "push" &&
          action != "increment" &&
          action != "define" &&
          action != "superDef" &&
          action != "remove"
         ) {
        VARS.respack.m="Invalid Action";
        //console.log("ACTION INVALID")
        return res.send(VARS.respack);
      }
      
      let param = req.body.param
      
      let value = JSON.parse(req.body.value)
      //console.log(value)
      
      if(param=='bgID'){
       if(!(await DB.userDB.findOne({id:target})).modules.bgInventory.includes(value)) {
             await DB.userDB.set(USER.id,{'blacklisted':"XSS Attempt - BG ["+value+"]"});
         return fx.xss_me(res, VARS.respack);
       }
      }
      if(param == 'flairTop'){
       if(!(await DB.userDB.findOne({id:target})).modules.flairsInventory.includes(value)) {
         await DB.userDB.set(USER.id,{'blacklisted':"XSS Attempt - Flairs ["+value+"]"});
         return fx.xss_me(res, VARS.respack)};
        
      }

      if(param == 'donator'){
    
         await DB.userDB.set(USER.id,{'blacklisted':"XSS Attempt - Frame ["+value+"]"});
         return fx.xss_me(res, VARS.respack)
      };
        


      if(target==undefined) throw("ERROR target undefined");
      if(param==undefined)  throw("ERROR param undefined");
      if(value==undefined)  throw("ERROR value undefined");
      if(action==undefined) throw("ERROR action undefined");

      try{
        
        
        //console.log(action,"ACTION")
        //console.log(param,"PARAM")
        //console.log(value,"VAL")
        //console.log(target,"USR")
        switch(action){
          case "push":
            await scope.set(target,{$push:{['modules.'+param]:value}});
            break; 
            
          case "increment":
            await scope.set(target,{$inc:{['modules.'+param]:value}});
            break;
                        
          case "define":
            await scope.set(target,{$set:{['modules.'+param]:value}});
            break;
                                    
          case "superDef":
            await scope.set(target,{$set:{[""+param]:value}});
            break;
                                    
          case "remove":
            await scope.set(target,{$pull:{['modules.'+param]:value}});
            break;
         }


        VARS.respack.c=VARS.col.suc;
        VARS.respack.t=VARS.ZT("success")
        VARS.respack.b="OK";
        VARS.respack.s="success";
        VARS.respack.m="All saved!";
        return res.send(VARS.respack);

      }catch(e){
        console.warn(e)
        VARS.respack.m="ERROR!";
        VARS.respack.t=e.error;
        VARS.respack.m=e.stack;
        return res.send(VARS.respack);
      }

    } catch (e) {
      console.warn(e)
      res.send(VARS.respack)
    };
  },
  
  //POST
  
  commiprofile:async function (req, res) {

    try {
      
      //console.log("receuve")
      let action = req.body.operation
      let data = req.body.data
      let uid = req.user.id
      let usr = req.user
      DB.userDB.findOne({id:uid}).then(async userdata=>{
        
      let respack = VARS.respack

      function get_bginv() {
        let bgInv;

        try {
          bgInv = userdata.modules.bgInventory
        } catch (e) {
          
          //fx.run("userSetup",bot.users.get(uid))
          bgInv = userdata.modules.bgInventory
        }

        if (bgInv == undefined) bgInv = ["5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6"];

        return bgInv;
      }

      if (action == "sticker") {
        let stkInv = userdata.modules.stickerInventory || []

        if (stkInv.filter(stk => stk == data).length > 0) {

          await DB.userDB.set(usr.id, {$set:{"modules.sticker": data}});

          respack.b = "Thankies"
          respack.c = VARS.col.suc
          respack.s = "success"
          respack.t = VARS.ZT("success")
          respack.m = "Enjoy your brand new Sticker!"
          res.send(respack)

        } else {
          fx.xss_me(res, respack)
        }
      }
        
      if (action == "background") {
        let bgInv = get_bginv()

        if (bgInv.filter(bg => bg == data).length > 0) {

          await DB.userDB.set(usr.id, {$set:{"modules.bgID": data}});

          respack.b = "Thankies"
          respack.c = VARS.col.suc
          respack.s = "success"
          respack.t = VARS.ZT("success")
          respack.m = "Enjoy your brand new background!"
          res.send(respack)

        } else {
          fx.xss_me(res, respack)
        }

      }

      if (action == "about") {
        await DB.userDB.set(usr.id, {$set:{"modules.persotext": data}});

        respack.b = "Nice!" 
        respack.c = VARS.col.suc
        respack.s = "success"
        respack.t = VARS.ZT("success")
        respack.m = "Your new personal text has been set!"
        res.send(respack)


      }

      if (action == "medals") {
        
             await DB.userDB.set(usr.id, {$set:{"modules.medals": data}});

        respack.b = "Sweet!"
        respack.c = VARS.col.suc
        respack.s = "success"
        respack.t = VARS.ZT("success")
        respack.m = "Your Medals has been rearranged!"
        res.send(respack)

      }

      if (action == "all") {
        let bgInv = get_bginv()
        if (bgInv.filter(bg => bg == data.bg).length == 0) {
          fx.xss_me(res, respack)
        }

     await DB.userDB.set(usr.id, {$set:{"modules.medals": data.md}});
     await DB.userDB.set(usr.id, {$set:{"modules.persotext": data.tx}});
     await DB.userDB.set(usr.id, {$set:{"modules.bgID": data.bg}});


        respack.b = "Done!"
        respack.c = VARS.col.suc
        respack.s = "success"
        respack.t = VARS.ZT("success")
        respack.m = "Your Profile has been saved!"

        res.send(respack)

      }

})
    } catch (e) {
      //console.warn(e)
      VARS.respack.t = VARS.ZT("error")
      res.send(VARS.respack)
    };
  },
    
  partners: async function (req, res, next) {
        let USR=req.user
     let partners = await DB.serverDB.find({'partner':true});
    res.render('ptnship',{partners});
  },
  
  applyptn: function (req, res, next) {

    res.render('partform');
    
  },  
  
  locranks: async function (req, res, next) {
    let USR = req.user
 
    let ID = req.params.id
    let dbpars = await DB.serverDB.findOne({
      id: ID
    });
        
    const operations = require('./operations.js');
    let g = dbpars.meta
    dbpars.avi = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
    dbpars.id = req.params.id;
    bot = {}
    bot.server = dbpars.meta;
    let user = await DB.userDB.findOne({
      id: req.user.id
    });
    delete require.cache[require.resolve('../../utils/i18n.json')];
    const i18n = (require('../../utils/i18n.json'));

    let loranks = []
    //console.log('ante')
    
   await Promise.all(Object.keys(dbpars.modules.LOCALRANK).map(async i => {
      try{     
      let u = dbpars.modules.LOCALRANK[i];
      let usr = await DB.userDB.findOne({id:i}); //await bot.fetchUser(i);      
      let x = {
        tag: usr.tag||(usr.meta||{tag:false}).tag||usr.name,
        id: usr.id,
        exp: u.exp,
        level: u.level,
        pix: usr.avatar||(usr.meta||{avatar:'https://cdn-images-1.medium.com/max/230/1*OoXboCzk0gYvTNwNnV4S9A@2x.png'}).avatar
      }      
      if(u.level>0)loranks.push(x);
      }catch(e){}
      }));
    
    let sortie = function sortie(a, b) {
      return b.exp - a.exp
    }
    loranks.sort(sortie);

    res.render('localeads', {
      title: dbpars.meta.name + " | Local Ranks",
      server: dbpars,
      langs: operations.getLangs(),
      sv: dbpars.meta,
      bot,
      loranks
    })
  },
  
  discord: function (req, res, next) {     
    
    if (req.query){
      let ref = req.query.ref;
      DB.serverDB.set(ref,{$inc:{'partnerDetails.refs':1}});
    }
    
    res.redirect("/");
  },
  
  somegear: function (req, res, next) {
    let id = req.params.id;
    let img;
    if(id=="banzai01"||id=="banner-pt"){
      let rand = DB.randomize(1,3)
      //console.log(rand)
      img =  "banner-pt0"+rand
    }

      
    res.sendFile('/root/v7/dash/public/images/banners/'+img+'.png')
    
    
  },
    
  art: async function (req, res, next) {
    let USR=req.user
    
    
    let fanart = await DB.fanart.find({});
    let fanart_DB =DB.fanart;
    res.render('artwork',{fanart,fanart_DB})
    
  },
  
  

  
  custombgshop: async function(req,res){
    
      let user
      let USR
      let updir = __dirname
      let userdata = false
      let rerities = ["UR", "SR", "R", "U", "C"]
      

    
    let handle= req.params.handle;
    let serverinfo = await DB.serverDB.findOne({globalhandle:handle})|| await DB.serverDB.findOne({id:handle});
     if (!serverinfo)  res.render("nope");
     let handie = serverinfo.id;    
            if (!serverinfo.partner && handle!="pollux")  res.render("nopart");
    
    
        if (!req.user) {

          return res.render('needlogin', {
            opengraph: {
              color: serverinfo.partnerDetails.color,
              image: serverinfo.partnerDetails.picture,
              large: true,
              title: serverinfo.meta.name + " Exclusive Background Shop",
              description: serverinfo.partnerDetails.description
            }
          })
        }
    
     
      res.render('privatebgshop', {
        title: serverinfo.meta.name+" Exclusive Background Shop",
        opengraph:{
                color: serverinfo.partnerDetails.color,
                image:serverinfo.partnerDetails.picture,
                large:true,
                title:serverinfo.meta.name+" Exclusive Background Shop",
                description: serverinfo.partnerDetails.description
              },
 
        user: user,
         serverinfo,
        gear:gear
      });
  },  
  
  
  custommedalshop: async function(req,res){
      let user
      let USR
      let userinfo
      let updir = __dirname
      let userdata = false
      let rerities = ["UR", "SR", "R", "U", "C"]

    
    let handle= req.params.handle;
    let serverinfo = await DB.serverDB.findOne({globalhandle:handle})|| await DB.serverDB.findOne({id:handle});
     if (!serverinfo)  res.render("nope");
     if (!serverinfo.partner && handle!="pollux")  res.render("nopart");
     let handie = serverinfo.id;
          
    
        if (!req.user) {
         
          return res.render('needlogin', {
            opengraph: {
              color: serverinfo.partnerDetails.color,
              image: serverinfo.partnerDetails.picture,
              large: true,
              title: serverinfo.meta.name + " Exclusive Medal Shop",
              description: serverinfo.partnerDetails.description
            }
          })
        }
    
    

              res.render('privatemedalshop', {
        title: serverinfo.meta.name+" Exclusive Medal Shop",
        opengraph:{
                color: serverinfo.partnerDetails.color,
                image:serverinfo.partnerDetails.picture,
                large:true,
                title:serverinfo.meta.name+" Exclusive Medal Shop",
                description: serverinfo.partnerDetails.description
              },
        serverinfo,
        user: user,
                gear:gear
      });
  },  

  
  custombgshopPage: async function (req, res, next) {
    let handle= req.params.handle;
    let pagetype= req.params.pagetype;
    let page= req.params.page;
    //console.log({handle,pagetype,page})
        
    
    let catalog = await loadCustomCosmetics(req,pagetype,handle);
    
    let tp;
    switch(pagetype){
      case "bg":
        tp = "bg";
        break;
      case "medal":
        tp = "md";

    }
    res.render('shop/c_'+tp,catalog)
    
  },
    overclock: async function overclock(req,res,next){
        

   
    
    let donorsbase = await  DB.userDB.find({donator:{$exists:true}});
    
    res.render('donate', {
      title: 'Donate',
     
        donorsbase: donorsbase
    });

  
    },
  usinf:  async function (req, res, next) {
    let info = req.body.payload;
    let ID = req.body.id.toString();
    
     await DB.userDB.set(ID,{$set:{personal:info}});
    res.send(200)
  },
  
  audits: async function (req, res, next) {
    
    let usid = req.params.id == "all" ? "271394014358405121" : req.params.id
    let filterCurr = req.query.c
    let filterType = req.query.t
    let filterDate = req.query.date
    let filterTrans = req.query.ts
    let filterid = req.query.id 
    let amt = Number(req.query.amt ||100)
    
    let userdb = await DB.userDB.findOne({id:usid});
    let auditurs,audits_mi=[],subaudits;
    
    if(!userdb){  
      filterid = usid;
      
    }else{
      auditurs =  await DB.audits.find({$or: [{to:usid}, {from:usid}]}).sort({timestamp:-1}).limit(amt);
       audits_mi = auditurs.filter(f=>{
        if(filterCurr&&filterCurr != f.currency) return false;
        if(filterTrans&&filterTrans != f.transaction) return false;
        if(filterType&& !f.type.includes(filterType)) return false;
        return true;
      }).slice(req.query.piece*amt||0,req.query.piece*amt+amt||amt);
    }
    
    if(filterid){
      audits_mi = (await DB.audits.findOne({'transactionId':filterid}));
      auditurs = audits_mi[0].to
    }

    
   // res.send(auditurs)
     let pol = usid == '271394014358405121'
     subaudits = await  DB.userDB.find({id:{$in:auditurs.map(fx=>!pol?fx.from:fx.to)}},{id:1, name:1,'meta.tag':1});
    
    if(req.query.piece){
      return res.render('_auditpiece', {
        subaudits,
        audits_mi,
        userdb,
        selfID:usid
      })
    };
    
    res.render('audits', {
      title: "AUDITS",
      subaudits,
      audits_mi,
      userdb,
      selfID:usid
     
    
    })
    
  },
  
  money: async function (req, res, next) {
    
    if(req.query.namecheck){
      let rq=req.query.namecheck
      DB.userDB.findOne({personalhandle:rq}).then(usr=>{
        //console.log({usr})
        if(usr===null){
          res.send("ok");
        }else{
          res.send("nope");          
        }
      })
    }
    
    
        //console.log(req.query)
    delete require.cache[require.resolve('./money.js')]
    let mony =  require('./money.js');

    if(req.query.paypal){
      if(req.query.paypal=="payment"){
        console.log("Enter Payment")
        return mony.paypalTransaction(req,res);
        
      }
      
      
      if(req.query.paypal=="webhook"){
        
        let pload=  req.body.payload

        if(fx.userBasics(req.user)){
          
         let usinfo = fx.userBasics(req.user)
         
        let FLDS = pload.transaction.items.items.map(itm=>{
          return {
            name:"Item",
            value: itm.name + " x "+ itm.quantity,
            inline:true
          }
        });
        FLDS.push({"name": "TOTAL","value": pload.transaction.amount});
        let embedJson={
          "content": "New PayPal Transaction",
          "embeds": [
            {
              "url": "https://discordapp.com",
              "color": 2575842,
              //"timestamp": pload.ts,
              "thumbnail": {
                "url": usinfo.pix
              },

              "author": {
                "name": usinfo.name,
                "url": "https://pollux.fun/profile/"+usinfo.id,
                "icon_url": usinfo.pix
              },
              "description":`**Name**: ${pload.name}
**Email**: ${pload.email}`,
              "fields": FLDS      
            }
          ]
        }
        sendWebhook(embedJson);
          
        let meta=  req.body.meta
        meta.id=  req.body.meta.item

        DB.buyables.findOne({id: meta.id}).then(konoItem => {

          let TOTAL,
          QTD=meta.amt || 1;
          const send = konoItem.sendTo;
          let querystring;
          
          const allTiers = require('../../../core/modules/misc/rw_.js').TIERS;
          const PushMo = require('../../../core/modules/misc/rw_.js').queryGen;
          

          if(konoItem.sendTo=="jades")          querystring = {$inc:{"modules.jades":QTD*1000}};
          if(konoItem.sendTo=="sapphires")      querystring = {$inc:{"modules.sapphires":QTD}};
          if(konoItem.sendTo=="inventory")      querystring = {$push:{"modules.inventory":meta.id}};   
          if(konoItem.sendTo=="bgInv")          querystring = {$addToSet:{"modules.bgInventory":meta.id}};   
          if(konoItem.sendTo=="stInv")          querystring = {$addToSet:{"modules.stickerInventory":meta.id}};   
          if(konoItem.sendTo=="medalInv")       querystring = {$addToSet:{"modules.medalInventory":meta.id}};   
          if(konoItem.sendTo=="personalhandle") querystring = {$set:{"personalhandle":meta.handle}};   
          
          
          if(konoItem.sendTo=="tier"){
            
            const TIER = allTiers[konoItem.id];
            let ts = new Date();
            
            querystring = PushMo(TIER)
            querystring['$set']['switches.donationAcquiredViaWebsite']=ts
              
              
            
            
            
            /*
            switch(konoItem.id){
            case "aluminium":
              querystring = {
                $inc:{"modules.sapphires":1},
                $push:{
                  'modules.inventory':{
                    $each:['lootbox_C_O','lootbox_C_O','lootbox_C_O','lootbox_C_O','lootbox_C_O']}
                },$set:{donator:'aluminium'}
              };
              break;
            case "carbon":
              querystring = {
                $inc:{"modules.sapphires":5},
                $push:{
                  'modules.inventory':{
                    $each:['lootbox_U_O','lootbox_U_O','lootbox_U_O','lootbox_U_O','lootbox_U_O']}
                },$set:{donator:'carbon'}
              };
              break;
            case "iridium":
              querystring = {
                $inc:{"modules.sapphires":15},
                $push:{
                  'modules.inventory':{
                    $each:['lootbox_R_O','lootbox_R_O','lootbox_R_O','lootbox_R_O','lootbox_R_O']}
                },$set:{donator:'iridium'}
              };
              break;
            case "palladium":
              querystring = {
                $inc:{"modules.sapphires":25},
                $push:{
                  'modules.inventory':{
                    $each:['lootbox_SR_O','lootbox_SR_O','lootbox_SR_O','lootbox_SR_O','lootbox_SR_O']}
                },$set:{donator:'palladium'}
              };
              break;
            case "uranium":
              querystring = {
                $inc:{"modules.sapphires":50},
                $push:{
                  'modules.inventory':{
                    $each:['lootbox_UR_O','lootbox_UR_O','lootbox_UR_O','lootbox_UR_O','lootbox_UR_O']}
                },$set:{donator:'uranium'}
              };
              break;
            }
            */
          };       
       
          DB.userDB.set(req.user.id,querystring).then(usr=>{
            sendWebhook({"embeds": [{"color": 3860741,"description":"*Items added to database successfully with querystring: "+JSON.stringify(querystring)}]});
          });
          DB.buyables.findOneAndUpdate({id:konoItem.id},{$inc:{'other.purchased':1}}).then(x=>console.log("Incremet DB Purchase OK"));
          DB.audit(req.user.id,konoItem.price_USD,`cash_shop_event[${konoItem.id}]`,"USD","-");
          
        });
        res.sendStatus(200);
          
        }else{
          res.sendStatus(403);
        }
      }
    if(req.query.paypal=="onAuthorize"){
      return res.json(req.body);        
    }
    
  }
  
    if(req.query.pagSeguro=="session"){
      mony.pagSeguroSession(req,res);
  
    }
  },
  
  daily: async function (req, res, next) {
  
  const STREAK_EXPIRE = 1.296e+8*2
  const DAY = 7.2e+7
  const USERDATA = await DB.userDB.findOne({id:req.user.id});
  const now        = Date.now();
  let   hardStreak = USERDATA.modules.dyStreakHard+1 || 1;
  let   softStreak = (hardStreak % 10 || 0) + 1;
    const userDaily  =USERDATA.modules.daily || 1;
  const dailyAvailable = now-userDaily >= DAY;
  const streakGoes = now-userDaily <= STREAK_EXPIRE;

    let response =""

  if(dailyAvailable){

   
  if(streakGoes) {
    DB.userDB.set(USERDATA.id, {
      $inc:{
        'modules.dyStreakHard':1
      }
    });
    response += "(STREAK KEEPS ["+USERDATA.modules.dyStrakHard+"])\n"
  }else{
    response += "(STREAK LOST)\n"
    DB.userDB.set(USERDATA.id, {
      $set:{
        'modules.dyStreakHard':1
      }
    });
    hardStreak = 1
  }

    console.log(response)
    
    let myDaily = 100;
    
    if(USERDATA.donator == "aluminium") myDaily+=50;
    if(USERDATA.donator == "carbon") myDaily+=50;
    if(USERDATA.donator == "iridium") myDaily+=100;
    if(USERDATA.donator == "palladium") myDaily+=150;
    if(USERDATA.donator == "uranium") myDaily+=200;
    if(USERDATA.donator == "astatine") myDaily+=250;
    //if(USERDATA.donator == "aluminium") myDaily+=50;

  DB.userDB.set(USERDATA.id, {$set:{'modules.daily':now}}).then(async userData=>{
  
    await Promise.all([
      ECO.receive(USERDATA.id,myDaily,"daily_website","RBN","+"),
    
    ]);
response += "\nRegular Daily: "+myDaily
    console.log(response)

    if ((hardStreak%10) == 0) {
    response += "\n10-day Streak Bonus: "+500+" Rubines"
      await Promise.all([
        DB.userDB.set(USERDATA.id, {$inc:{ 'modules.exp':100}}),
        ECO.receive(USERDATA.id,500,"daily_10streak_website","RBN","+")
      ]);
    }
    console.log(response)
    

    if ((hardStreak%3) == 0) {
    response += "\n2-day Streak Bonus: "+1000+" Jades"
      await Promise.all([
        DB.userDB.set(USERDATA.id, {$inc:{'modules.jades':1000,'modules.exp':50}}),
        ECO.receive(USERDATA.id,1000,"daily_3streak_website","JDE","+")
      ]);
    }
    
    console.log(response)

    if ((hardStreak%200) == 0) {
    response += "\n200-day Streak Bonus: "+1+" Sapphire"
      await Promise.all([
        DB.userDB.set(USERDATA.id, {$inc:{ 'modules.exp':5000}}),
        ECO.receive(USERDATA.id,1,"daily_250streak_website","SPH","+")
      ]);
    }
    console.log(response)

    if ((hardStreak%365) == 0) {
    response += "\n365-day Streak Bonus: "+1+" Sapphire"
      await Promise.all([
        DB.userDB.set(USERDATA.id, {$inc:{ 'modules.exp':25000}}),
        ECO.receive(USERDATA.id,1,"daily_365streak_website","SPH","+")
      ]);
    }
    console.log(response)

    const snekfetch = require('snekfetch')
    const token = DB.cfg.liscordtoken;
    let votes = await snekfetch.get('https://listcord.com/api/bot/271394014358405121/votes')
      .set('Authorization', token);
    
    let uservote =  votes.body.find(vote=>vote.id==USERDATA.id)
    if(uservote){
      let xx = uservote.count
    response += "\nListcord Bonus: "+(xx*10)+" Rubines"
      await Promise.all([
      
        ECO.receive(USERDATA.id,xx,"upvote_daily_boost_website","RBN","+")
      ]);
    }
    
    if (userData.spdaily && userData.spdaily.amt){
    response += "\nSpecial Bonuses: "+USERDATA.spdaily.amt+" Rubines"
      await Promise.all([
     
        ECO.receive(USERDATA.id,USERDATA.spdaily.amt,"special_daily_boost_website","RBN","+")
      ]);
    }

    console.log(response)
    return res.send(response)

  });


    
  }else{
    
    return res.send("You already Claimed your dailies today.")
  }
  },
  
  
  test: function (req, res, next) {},
  test: function (req, res, next) {
    //console.log(fx.botFetch);
    
   fx.shard.request('broadcast flat','this.guilds.get("277391723322408960").members.map(s=>{return {tag:s.user.tag,id:s.id,avatar:s.user.avatarURL||s.user.defaultAvatarURL,displayName:s.displayName||s.user.username}})', async function (x){
    //console.log(x)
    //fx.shard.request('broadcast flat','this.users.map(s=>{return {tag:s.tag,id:s.id,avatar:s.avatarURL||s.defaultAvatarURL,displayName:this.guilds.get("277391723322408960").members.get(s.id).displayName||s.username}})',function (x){

          fx.shard.request('broadcastEval','try{this.users.get("88120564400553984").send("waaaaa").then(x=>"wawa")}catch(e){console.warn(e)} ',function (x){

            //console.log(x)
     res.send({BGBASE})
    })

     BGBASE = await DB.cosmetics.bgs();
     
    });
    
    ('guilds.size')
   // res.send(fx.botFetch('guilds.size'))
  },
  

}
  

   let loadCustomCosmetics = async function (req,coletype,handle ){
     
    let BASE;
//console.log({handle,coletype})

     let handie = (await DB.serverDB.findOne({globalhandle:handle})||await DB.serverDB.findOne({id:handle})).id;    
    
     //console.log({handie})
     
    if (coletype=="medal") BASE= (await DB.cosmetics.medals({ type: "medal",exclusive:handie })).filter(md=>!md.event || md.event=='false' ).reverse();
    if (coletype=="sticker") BASE= (await DB.cosmetics.stickers({ type: "sticker",exclusive:handie })).filter(sk=>!sk.event || sk.event=='false' ).reverse();
    if (coletype=="bg") BASE= (await DB.cosmetics.bgs({ type: "background",exclusive:handie })).filter(bg=>!bg.event || bg.event=='false' ).reverse();
     
    if(!BASE) return "no base";
    
     //console.log(BASE)

     
    let tags=req.query.tags?req.query.tags.split(' '):[];

    let intersection = BASE.filter(item=>{
      let rari=true, tagi=true, evi=true;      
      if (req.query.rarity&&'CURSR'.includes(req.query.rarity)){
        rari = item.rarity==req.query.rarity ? true : false;
      }
      if (tags.length>0){
        tags.forEach(tag=>{
          if(!item.tags.includes(tag)) tagi = false;
        });
      }
      if(req.query.event){
      //  evi = item.event ? true : false;
      }     
      return rari && tagi && evi;      
    })

    let max = req.query.max || 49;
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

    if (req.query.json == "true") {
      return {
        F,
        elpis_prv,
        P,
        C,
        N,
        elpis_nex,
        L,
        content: pageArray,
        intersection,
        stata: {
          x: req.query.rarity != undefined,
          y: tags.length > 0
        }
      }
    } else {
      return {
        gear,
        F,
        elpis_prv,
        P,
        C,
        N,
        elpis_nex,
        L,
        intersection,
        fullquery,
        max,
        query: req.query
      };
      
      
    }
  };
const request = require('request');
function sendWebhook(data){  
  //console.log(data,typeof data)
 // data.description = encodeURIComponent(data.description)
  frm = (JSON.stringify(data)+"")
  console.log((frm))
  let opts={    url:"https://discordapp.com/api/webhooks/538667568135929866/CUjL2BcS1YsCkoMy6DR-T8kY4lMW2Ep9d62X5HzSdwhv2T-3Ct5HV0A0vaOrs15gpNr2?wait=true",
  body: data,
            json:true,
    //dataType: 'json',
    //processData: false,
            headers:{
              'content-Type':'application/json'
            },
    method: 'POST'}
      request(opts, function (error, response, body) {
        console.log("WebHook'd")
      })
}