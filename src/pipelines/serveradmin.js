// const DB = require('../database')
const fs = require('fs')
  
  
 
  

exports.run = function(req,res,dbpars,theG, USR){
  return new Promise(async resolve=>{
  try{
    
    const operations = require('./operations.js');
    if(!dbpars.meta)return resolve("Server not Configured");
    if (dbpars.meta &&!dbpars.meta.adms) dbpars.meta.adms = req.user.guilds.find(s=>s.id==dbpars.id).owner ? [req.user.id] : false;
    //let this_member = bot.guilds.get(theG.id).members.get(req.user.id);    
    let MOD =(dbpars.meta.adms||[]).includes(req.user.id);
    
    console.log(dbpars.meta.adms)
/*    
    console.log(this_member.roles.map(f=>f.id))
    console.log(dbpars.modules.MODROLE)
    console.log(MOD)
  */  
if(!req.user.guilds.find(g=>g.id==theG.id&&g.owner==true)&&!['88120564400553984','200044537270370313'].includes(req.user.id)&&!MOD)res.sendStatus(403);

    let g = req.user.guilds.find(ge => ge.id == req.params.id)
    if(g){      
      dbpars.avi = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
    }
    dbpars.id  = req.params.id;
    bot={}
    bot.server = dbpars.meta;
    let user= await DB.users.findOne({id:req.user.id})
    delete require.cache[require.resolve('../../utils/i18n.json')];
    const i18n = (require('../../utils/i18n.json'));
    
    let loranks = []
    console.log('ante')
    let eligiblelorank = await DB.localranks({server:theG.id});
    await Object.keys(eligiblelorank).forEach(async i => {
      try{     
      let u = i;
      let usr = await DB.users.findOne({id:i.user}); //await bot.fetchUser(i);      
      let x = {
        tag: usr.tag||(usr.meta||{tag:false}).tag||usr.name,
        id: usr.id,
        exp: u.exp,
        level: u.level,
        pix: usr.avatar||(usr.meta||{avatar:'https://cdn-images-1.medium.com/max/230/1*OoXboCzk0gYvTNwNnV4S9A@2x.png'}).avatar
      }      
      if(u.level>0)loranks.push(x);
      }catch(e){}
      });
    
    let sortie=function sortie(a,b){return b.exp-a.exp}

    let commands = operations.cmsSetup(req);
    
    let chandata = await DB.channelDB.find({id:{$in:theG.channels.map(c=>c.id)}});
    let inde=0
    let svChannels = dbpars.meta.channels.filter(f=>f.type=='text');
        
    svChannels.sort((a,b)=>a.pos-b.pos)

    loranks.sort(sortie);
    
    loranks=loranks.slice(0,99)
    let muteds = []
    
    res.render('adminpanel', {
      title: dbpars.meta.name+" | Admin Panel",
      server: dbpars,
      userinfo: USR,
      langs: operations.getLangs(),
      sv: dbpars.meta,
      muteds,
      
      bot,user,i18n,loranks,chandata,svChannels,commands
    })
  
  }catch(e){
    console.log(e)
    return "Internal Server Error"
  }
  })
}
