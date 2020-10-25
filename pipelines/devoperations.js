// const DB = require('../database')
exports.run = function(req,res,auth){
  
  return new Promise(async resolve=>{
    

    if(req.params.page === "bgshop"){
      
      
      
      
      return res.render("beta/generalshop");
    }
    
    
    
    
    
    let USR=req.user
    let userinfo
    if(USR){
    userinfo= {
        pix: `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
        name: `${USR.username}#${USR.discriminator}`,
        uname: USR.username,
        id: USR.id,
        discriminator: USR.discriminator,
        servers:USR.guilds||USR.servers
      }
    }
    
    if(req.params.page=='partform') auth(req,res,function(){});
    
    console.log(req.app.locals)
    
    let partners = await DB.serverDB.find({'partner':true});
    let fanart = await DB.fanart.find({});
    let fanart_DB =DB.fanart;
    let items = await DB.items.getAll();
    let shopstock = await DB.buyables.find({});
    
    let STICKERBASE = await DB.cosmetics.find({type:"sticker"});
    let BOOSTERS = await DB.items.find({type:"boosterpack"});
    
    //let userdata = USR? await DB.userDB.findOne({id:(USR.id||'none')}) : {}
    res.render(req.params.page,{userinfoB64: toBase64(userinfo),userinfo: userinfo,partners,fanart,fanart_DB,items,shopstock,STICKERBASE
,BOOSTERS})
  })
  
}