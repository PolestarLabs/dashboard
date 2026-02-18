//const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";
const fx = require('./globalFunctions.js');
const fs = require("fs");
const formidable = require('formidable')
//const md5 = require('md5')
const path = require('path')
//const IMAGEMAGICK = require('imagemagick');

exports.run = function(req,res,form){
  
  return new Promise(async resolve=>{ 
  try{
      let embed = {fields:[]};
      let ts = new Date()
            

      USR = req.user || { username: "unauth" };
      embed.title = "📠 New Form Submission";
      // build author safely — only include avatar_url when we have id + avatar
      const _author = { name: USR.username || "unauth" };
      if (USR.id && USR.avatar) _author.avatar_url = `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`;
      embed.author = _author;
      embed.description = "Submission from **" + (req.query.from || "unknown") + "** Form";
      // footer should derive id from USR with a safe fallback
      embed.footer = { text: USR.id || "" };

      embed.timestamp = ts

if(req.query.type=='fanart'){
  console.log("fana");
  return require("../routes/forms/fanart.js").processForm(form,req,res,{sendWebhook,embed,ts});
}else{
    
    form.parse(req, function(err, fields, files) {

      embed.color = 0xe02b63
      
      if(req.query.from == "Parnership Update"){        
     

        
        DB.serverDB.set(fields.ID, {
          $set: {
            "partnerDetails.owner": USR.username,
            "partnerDetails.ownerID": USR.id,
            "partnerDetails.description": fields.description,
            "partnerDetails.website": fields.website,
            "partnerDetails.tags": fields.tags,
            "partnerDetails.feats": fields.feats,
            "partnerDetails.langs": fields.langs,
            "partnerDetails.region": fields.region,
            "partnerDetails.picture": fields.picture,
            "partnerDetails.invite": fields.invite
          }
        }).then(x=>{"ok"})
        return setTimeout(f=>res.redirect('/'),1000);
      }
      
      console.log(fields)
      
      Object.keys(fields).forEach(field=> {
        if(fields[field]){
          
        embed.fields.push({name:field,value:fields[field],inline:true});    
        }
      })
      
/*
let username= fields.username,
     userId= fields.userId,
     server= fields.server,
     about= fields.about,
     desc= fields.desc,
     site= fields.site,
     invite= fields.invite,
     tags= fields.tags,
     feats= fields.feats,
     location= fields.location,
     langs= fields.langs
364820616349614080
*/

      /*
       fx.shard.request('broadcast','this.channels.get("401905121652506624").send({embed:'+(JSON.stringify(embed))+'})', function (x,y){
          console.log(x)
        // res.send(x)
        //bot.users.get("88120564400553984").send({embed}).then(x=>{
          setTimeout(f=>res.redirect('/'),1000)
        })
        */
      

      
      let embed2 = {}
      embed2.title = embed.title
      embed2.fields = embed.fields
      //embed2.description = embed.description
      embed2.color = embed.color
      //embed2.timestamp = embed.timestamp
      sendWebhook({"embeds":[embed2]} ,"https://discord.com/api/webhooks/789738553037946932/2dn-1c_EzaABoCufkZ-CHMoK7TqHtCm5UGkhGSq6F3p-h0CQ_4je_YPMiyaSUWRjlWQV?wait=true");


    })
}
  }catch(e){
    console.log(e)
    resolve("INTERNAL ERROR")
  }
  })
  
}
request = require('request')
function sendWebhook(data,url){  
  let opts={    
    url: url || "https://discordapp.com/api/webhooks/500544023988273154/JgZF9l4nPRQJ1lDu3ZisRMQx5vdRoOEJTZeFuu8F55fFclwKku_Jyn_YGRQDYnlYzNiB?wait=true",
    body: data,
    json:true,
  //  processData: false,
    headers:{
    'content-Type':'application/json'
    },
    method: 'POST'
  }
  request(opts, function (error, response, body) {
    console.log("• WebHook'd".bgCyan)
  })
}



