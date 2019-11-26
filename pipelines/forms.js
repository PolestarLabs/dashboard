// const DB = require('../database')
const fx = require('./globalFunctions.js');
const fs = require("fs");
const formidable = require('formidable')
const md5 = require('md5')
const path = require('path')
var im = require('imagemagick');

exports.run = function(req,res,form){
  
  return new Promise(async resolve=>{ 
  try{
      let embed = new DB.RichEmbed;
      let ts = new Date()
            

      USR=req.user
      embed.title = "📠 New Form Submission"
     if (!req.user) {
       USR={username:"unauth",discriminator:"0000"}
     }
    embed.setAuthor(`${USR.username}#${USR.discriminator}`,`https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,)
      embed.description = "Submission from **"+ req.query.from+"** Form"
      embed.setFooter(req.user.id)
      
      embed.setTimestamp(ts)

if(req.query.type=='fanart'){
  
    form.parse(req, function(err, fields, files) {      
           //console.log
        let new_path;
        let file_name; 
        let old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            ident = ((req.user||{id:'anonymous'}).id),
            author = req.user? req.user.username+"#"+req.user.discriminator : "Anonymous"
            let ts = new Date().getTime()
            file_name = md5(ts+ident);
            new_path =  "/root/v7/dash/public/images/artwork/"+ident+"/"+ file_name + '.' + file_ext; let thumb_path =  "/root/v7/dash/public/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext;                  

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
            publish:false
          }
        },{upsert:true}).then(x=>{"ok"});
      
      
        function ensureDirectoryExistence(filePath) {
          var dirname = path.dirname(filePath);
          if (fs.existsSync(dirname)) {
            return true;
          }
          ensureDirectoryExistence(dirname);
          fs.mkdirSync(dirname);
        }

        fs.readFile(old_path, function(err, data) {
            ensureDirectoryExistence(new_path);
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.semd("ERROR")          
                    } else {
                        try{
                          ensureDirectoryExistence(thumb_path);
                         im.resize({
                            srcPath: new_path,
                            dstPath: thumb_path,
                            width:   400
                          }, function(err, stdout, stderr){
                            if (err) res.send(err);
                            console.log('resized image to fit within 600');
                          });
                      
                      
                        res.status(200);
                        }catch(e){
                          res.send("OK!")
                        }
                    }
                });
            });
        });
        embed.addField("Title:",fields.title||'-none-');
        embed.setColor("#5257d1");
        embed.addField("Description:",(fields.description||"-none-"));
        embed.addField("Twitter:",fields.twitter||'-none-');
        embed.addField("Artist Page:",fields.page||'-none-');
        embed.setImage("http://pollux.fun/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext);
 
      
         let embed2 = {}
            embed.setColor("#5257d1")
      embed2.fields = embed.fields
      embed2.author = embed.author
      //embed2.description = embed.description
      embed2.color = embed.color
      embed2.title = "🖌 New Fanart Submission"
      embed2.footer = embed.footer
      //embed2.timestamp = embed.timestamp
      embed2.image={url:"http://pollux.fun/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext}
      sendWebhook({embeds:[embed2]});
      return res.redirect("/artwork");
    });
}else{
    
    form.parse(req, function(err, fields, files) {

      embed.setColor("#e02b63")
      
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
          
        embed.addField(field,fields[field],true);    
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
      sendWebhook({"embeds":[embed2]});


    })
}
  }catch(e){
    console.log(e)
    resolve("INTERNAL ERROR")
  }
  })
  
}
request = require('request')
function sendWebhook(data){  
  console.log(JSON.stringify(data))
  let opts={    url:"https://discordapp.com/api/webhooks/488956526086717440/75qIsOYk_gMRNj12Zab2en-O9vqJnNJ1EF_Me8Z6YdOs7c9wNWFy28JNKPGd2sKRHkFl?wait=true",
  form: data,
     json:true,
  //  processData: false,
            headers:{
               'content-Type':'application/json'
            },
    method: 'POST'}
      request(opts, function (error, response, body) {
        console.log("WebHook'd")
      })
}