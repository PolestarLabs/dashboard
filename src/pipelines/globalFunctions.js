const request = require("request");
const cfg = require('../../config')
const Path = require('path')

// const DB = require('../database') 
const VARS = require('./vars.js');
// const gear = {}// require('../../core/gearbox.js');
const fs = require('fs');


module.exports = { 
  

  userBasics: function(USR){
    try {
      return {
        pix: `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
        name: `${USR.username}#${USR.discriminator}`,
        uname: USR.username,
        id: USR.id,
        discriminator: USR.discriminator
      }
    } catch (e) {
      return this.universaldummy()
    }
  },

  api: function (scope, id,method,payload) {
        console.log('request================================================')
      return new Promise(async resolve=>{
        
    let options = {
        method: method||'GET',
        url: 'https://discordapp.com/api/' + scope + '/' + id,
        headers: {
          'Content-Type' : 'application/json',
          'cache-control': 'no-cache',
          authorization: 'Bot '+cfg.token
        }
      };
        console.log('request')
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        resolve(JSON.parse(body));
        console.log(body,typeof body,'request')
      });
      })  
  },


    
  universaldummy:function universaldummy(){
    return undefined;
    return {
        pix: `https://www.atomix.com.au/media/2015/06/atomix_user31.png`,
        name: `Guest`,
        uname: "GUEST",
        id: "0",
        discriminator: "0000"
      }
  }

  ,userDatabaseInfo: async function userDatabaseInfo(id,req){

      //let client_user = await bot.fetchUser(id) ;
      let dbpars;
      
      dbpars = await DB.userDB.findOne({id:id});
      try{
        if(!dbpars){
          req.user.tag=req.user.username+"#"+req.user.discriminator;
          await DB.userDB.new(req.user);
          dbpars = await DB.userDB.findOne({id:id});
        }      
      }catch(e){
          if(!dbpars){
            if(req.user){
              await DB.userDB.new(req.user);
              dbpars = await DB.userDB.findOne({id:id});
            }else{
              return null
            }
          }
      }
      return dbpars;
  }

,flatten: function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
  

  
  
  

,checkAuth: function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.render('needlogin')
  }

  ,failsafe: async function failsafe(dbo,req){
  return
  
 //console.log("ESSE [E P DENO",dbo)
  if (typeof dbo != "object" || !dbo.modules){
    dbo = defaults.udefal
    try{
      
     await fx.run("userSetup",{id:req.user.id,name:req.user.name})
     dbo = await userDB.findOne({id:req.user.id})
    }catch(e){
      console.log(e)
      
    }
  }
  
  return dbo
}

  

,cmsSetup: function cmsSetup(req) {
    let lang =   req.query.lang  == "en" ? "dev" :  req.query.lang  || "dev";
    let json 
    
    try{
      json = JSON.parse(fs.readFileSync(__dirname + "/../../../polaris/bot/locales/" + (lang||"dev") + "/commands.json"))
    }
    catch(e){
      console.log(e)
      
        json = JSON.parse(fs.readFileSync(__dirname + "/../../../bot/locales/" + (lang||"dev") + "/commands.json"))
    }
    let aliases = {} // just in case so it doesnt break
    json.lang = lang;
    let CMS = this.getComms(json,aliases);

    return {
      lang: lang,
      json: json,
      aliases: aliases,
      CMS: CMS,
      CATS:VARS.CATS
    }

  }

,getComms: function getComms(json,aliases) {
  let path =  Path.resolve(__dirname,"../../../bot/core" )
  let path_polaris = Path.resolve(__dirname + "../../../../bot/core")
  let files = fs.readdirSync(path + "/commands")
  let COMMANDS = {}
  let hidden = false;
  COMMANDS.list = []
  COMMANDS.categories = []
  COMMANDS.collection = []
   // console.log(files)

  for (i = 0; i < files.length; i++) {
    let filedir = Path.resolve(path, "commands/" , files[i]);

    if (files[i] != "dev" &&
      files[i] != "experimental" &&
      files[i] != "structures" &&
      files[i] != "donators" &&
      files[i] != "owner" &&
      !files[i].startsWith("_") &&
      files[i] != "eastereggs"
    ) hidden=true;
    else hidden = false;

    let morefiles = fs.readdirSync(filedir)    
   global.appRoot = Path.resolve(path,"..")
   global.paths =  require(Path.resolve(__dirname,'../../../../bot/utils/paths'));
   global._emoji = ()=>({});

      for (y = 0; y < morefiles.length; y++) {

        if (!["imgreactor.js","unstructured"].includes(morefiles[y])) {
          
          morefiles[y]=(morefiles[y].replace(".js", ""))
          COMMANDS.list.push(morefiles[y].replace(".js", ""))
          let smolAlias = Object.keys(aliases).map(a=>{return {alias: a, comm: aliases[a]}});
          
          try{
            delete require.cache[require.resolve(`${path}/commands/${files[i]}/${morefiles[y]}`)]
            let c=require(`${path}/commands/${files[i]}/${morefiles[y]}`);  
            //console.log({cat})
            if(!c.pub) hidden= true;
            else hidden = false;

            
          let categ = (VARS.CATS.find(ctgry=> ctgry.tags.includes(c.cat))||VARS.CATS.find(ctgry=> ctgry.tags.includes(files[i]))||{})
          COMMANDS.collection.push({
             name:c.cmd
            ,cat:     categ.consolidated || "misc"
            ,catName: categ.name || "misc"|| "Misc."
            ,aliases:(c.aliases||[])
            //,aliases_ext:(c.aliases||[]).concat(smolAlias.filter(a=>a.comm==c.cmd).map(a=>a.alias) )
            ,perms:c.botPerms
            ,desc: $t(['commands:help.'+c.cmd,''], {lngs: [json.lang,'en','dev']} )
            ,use: $t(['commands:usage.'+c.cmd,''], {lngs: [json.lang,'en','dev']} )
            ,filename: morefiles[y]
            ,hidden
          })

          
        }catch(e){
          //console.log((morefiles[y]+"").magenta)
          let hidden;
          try{
            let {pub} = require(`${path}/commands/${files[i]}/${morefiles[y]}`);  
            
            hidden = pub || true;
            console.log((morefiles[y]+"").yellow, pub)
          }catch(e){
            console.log((" "+morefiles[y]+" ").bgRed + " Error parsing command!".red) 
            console.log(e.message.yellow)
            console.log("-------------------".gray)
            hidden = true;
          }
          let ccmd = morefiles[y].replace(".js", "");
          let categ = (VARS.CATS.find(ctgry=> ctgry.tags.includes(files[i]))||{})

          COMMANDS.collection.push({
                  name:ccmd
                ,cat:     categ.consolidated || "misc"
                ,catName: categ.name || "Misc."
                ,aliases: []
                ,aliases_ext: (smolAlias.filter(a=>a.comm==ccmd).map(a=>a.alias) )
                ,perms: []
                ,desc: $t(['commands:help.'+ccmd,''], {lngs: [json.lang,'en','dev']} )
                ,use: $t(['commands:usage.'+ccmd,''], {lngs: [json.lang,'en','dev']} )
                ,filename: morefiles[y]
                ,hidden
              })
          }
        }

      }

  }

  return COMMANDS
}

,xss_me: function xss_me(res, respack) {
  respack.b = "Sorry"
  respack.t = "Are you trying something funny?"
  respack.m = "You do not own the background you're trying to apply!"
  res.send(respack)
}
  
,ZT: function ZT(x){
  let r = randomize(0,interj[x].length)
  return interj[x][r]
}
  

}