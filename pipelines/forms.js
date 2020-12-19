// const DB = require('../database')
const fx = require('./globalFunctions.js');
const fs = require("fs");
const formidable = require('formidable')
const md5 = require('md5')
const path = require('path')
const IMAGEMAGICK = require('imagemagick');

exports.run = function(req,res,form){
  
  return new Promise(async resolve=>{ 
  try{
      let embed = {fields:[]};
      let ts = new Date()
            

      USR=req.user
      embed.title = "📠 New Form Submission"
     if (!req.user) {
       USR={username:"unauth",discriminator:"0000"}
     }
    embed.author = { name:`${USR.username}#${USR.discriminator}`,avatar_url:`https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`}
      embed.description = "Submission from **"+ req.query.from+"** Form"
      embed.footer = {text: req.user.id}
      
      embed.timestamp = ts

if(req.query.type=='fanart'){
  
    form.parse(req, async function(err, fields, files) {

      console.log(fields)
           //console.log
        let new_path;
        let file_name; 

        let authorTag = req.user? req.user.username+"#"+req.user.discriminator : "Anonymous";
        let authorID = ((req.user||{id:'anonymous'}).id);
        let userData = req.user
        if (fields.behalf) {
          userData = await PLX.getRESTUser(fields.behalf);
          if(!userData) return res.status(400).json("WRONG BEHALF - NO USER")
          embed.author = { name:`${userData.username}#${userData.discriminator}`,avatar_url:`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
          authorTag = userData.username + "#" + userData.discriminator;
          authorID = userData.id;

        }

        if(!files.file) return res.status(400).json("FILE IS REQUIRED");
        let old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            ident = authorID,
            author = authorTag,
            ts = new Date().getTime();
            file_name = md5(ts+ident);
            new_path =  appRoot+"/dashboard/public/images/artwork/"+ident+"/"+ file_name + '.' + file_ext; let thumb_path =   appRoot+"/dashboard/public/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext;


      
        function ensureDirectoryExistence(filePath) {
          var dirname = path.dirname(filePath);
          if (fs.existsSync(dirname)) {
            return true;
          }
          ensureDirectoryExistence(dirname);
          fs.mkdirSync(dirname);
        }

        fs.readFile(old_path, function(err, data) {
          if (err) return console.error(err);
          
          ensureDirectoryExistence(new_path);
          fs.writeFile(new_path, data, function(err) {
            if (err) return console.error(err);
            
                fs.unlink(old_path, function(err) {
                    if (err) {
                        console.error(err)
                        res.semd("ERROR")          
                    } else {
                        try{
                          ensureDirectoryExistence(thumb_path);
                          console.log('imagik')
                         IMAGEMAGICK.resize({
                            srcPath: new_path,
                            dstPath: thumb_path,
                            width:   400
                          }, function(err, stdout, stderr){
                            if (err) console.log(err) && res.send(err);
                            console.log('resized image to fit within 600');
                          });
                      
                          DB.fanart.updateOne({id:ident+file_name}, {
                            $set: {
                              hash: file_name,
                              src: "/images/artwork/"+ident+"/"+ file_name + '.' + file_ext,
                              //thumb: "/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext,
                              description: fields.description,
                              title: fields.title,
                              date: ts,
                              artistTwit:fields.twitter,
                              artistlink:fields.page,
                              author: author,
                              author_ID: ident,
                              publish:false,
                              format: file_ext,
                            }
                          },{upsert:true}).then(x=>{

                            res.status(200);
                          });
                        
                      
                        }catch(e){
                          console.error(e)
                          res.send("OK?")
                        }
                    }
                });
            });
        });
        embed.fields.push({name:"Title:",value:fields.title||'-none-',inline:false});
        embed.color = 0x5257d1;
        embed.fields.push({name:"Description:", value: (fields.description||"-none-"), inline: false});
        embed.fields.push({name:"Twitter:", value: fields.twitter||'-none-', inline: false});
        embed.fields.push({name:"Artist Page:", value: fields.page||'-none-', inline: false});
        embed.image = {url: HOST + "/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext};
 
      
         let embed2 = {}
            embed.color = 0x5257d1
      embed2.fields = embed.fields
      embed2.author = embed.author
      //embed2.description = embed.description
      embed2.color = embed.color
      embed2.title = "🖌 New Fanart Submission"
      embed2.footer = embed.footer
      //embed2.timestamp = embed.timestamp
      embed2.image={url:HOST+"/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext}
      sendWebhook({embeds:[embed2]}, "https://discord.com/api/webhooks/789738553037946932/2dn-1c_EzaABoCufkZ-CHMoK7TqHtCm5UGkhGSq6F3p-h0CQ_4je_YPMiyaSUWRjlWQV?wait=true");
      return res.sendStatus(200) //res.redirect("/artwork");
    });
}else{
    
    form.parse(req, function(err, fields, files) {

      embed.color = 0xe02b63
      
      if(req.query.from == "Parnership Update"){
        
            console.log(fields)
    console.log(req.query.from)

        
        DB.serverDB.set(fields.ID, {
          $set: {
            "partnerDetails.owner": `${USR.username}#${USR.discriminator}`,
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
  console.log(JSON.stringify(data))
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
    console.log("WebHook'd")
  })
}