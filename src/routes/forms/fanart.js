const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";
const md5 = require('md5')
const IMAGEMAGICK = require('imagemagick');
const fs = require("fs");
const path = require('path');

async function processForm(form,req,res,{sendWebhook,embed}){

	let STATUS;
	let RESPONSE;
	form.parse(req, async function(err, fields, files) {

		console.log("\n "+" • NEW FANART SUBMISSION • ".bgBlue);

		let authorTag = req.user? req.user.username+"#"+req.user.discriminator : "Anonymous";
		let authorID = ((req.user||{id:'anonymous'}).id);
		let userData = req.user;

		if (fields.behalf) {
			userData = await PLX.getRESTUser(fields.behalf);
			if(!userData) return res.status(400).json("WRONG BEHALF - NO USER")
			embed.author = { name:`${userData.username}#${userData.discriminator}`,avatar_url:`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
			authorTag = userData.username + "#" + userData.discriminator;
			authorID = userData.id;
			console.log('•'.magenta + " Fanart: In behalf of ".gray + authorTag );
		}

		if(!files.file) return res.status(400).json("FILE IS REQUIRED");

		const old_path = files.file.path,
			file_size = files.file.size,
			index = old_path.lastIndexOf('/') + 1,
			file_ext = files.file.name.split('.').pop(),
			senderID = authorID,
			senderTag = authorTag,
			ts = new Date().getTime();

		const file_name = md5(senderID+file_size+files.file.name);
		const new_path =   `${ASSETS_PATH}/artwork/${senderID}/${file_name}.${file_ext}`;
		const thumb_path =    `${ASSETS_PATH}/artwork/thumbs/${senderID}/${file_name}.${file_ext}`;            
		const prev = await DB.fanart.findOne({hash:file_name});
		
		//if (prev) return res.status(409).json("YOU'VE ALREADY SENT THIS FILE!");

		fs.readFile(old_path, function(err, data) {
			if (err) return console.error(err);	

			ensureDirectoryExistence(new_path);
			fs.writeFile(new_path, data, function(err) {
				if (err) return console.error(err);

				console.log('•'.cyan + " Fanart: Unlink old...".gray );
				fs.unlink(old_path, function(err) {
					if (err) {
						console.error(err)
						return res.status(500).json("UNLINK ERROR");
					}
					console.log('•'.green + " Fanart: Unlink OK!" );
					try{
						ensureDirectoryExistence(thumb_path);
						console.log('•'.magenta + " ImageMagick: ".yellow + (`Processing ${file_name?.inverse}`).gray );					
						IMAGEMAGICK.resize({
							srcPath: new_path,
							dstPath: thumb_path,
							width:   400
						}, function(err, stdout, stderr){
							if (err) {
								console.error('•'.red + " ImageMagick: ".yellow + "ERROR!".red );
								console.error(err)
								return res.status(500).json(" ImagE PROCESSING ERROR");
							}
							console.log('•'.green + " ImageMagick: ".yellow + (`${"Success!".green}\n   ${thumb_path.gray}`) );					
						});
						console.log('•'.blue + " Saving Fanart to DB...".gray );
						DB.fanart.updateOne({id:senderID+file_name}, {
							$set: {
								hash: file_name,
								src: "/images/artwork/"+senderID+"/"+ file_name + '.' + file_ext,
								//thumb: "/images/artwork/thumbs/"+ident+"/"+ file_name + '.' + file_ext,
								description: fields.description,
								title: fields.title,
								date: ts,
								artistTwit:fields.twitter,
								artistlink:fields.page,
								author: senderTag,
								author_ID: senderID,
								publish:false,
							format: file_ext,
							}
						},{upsert:true}).then(x=>{
							console.log('•'.green + " Fanart: DB OK!" );
							return res.status(200).json("SUBMISSION RECEIVED! It is now pending approval of a moderator...");
						}).catch(err=>{
							console.error('•'.red + " Fanart: DB NOT OK!" );
							console.error(err);
							return res.status(500).json("SUBMISSION NOT RECEIVED! Something went wrong when saving your submission.");
						});			
					}catch(e){
						console.error('•'.red + " Fanart: General error." );
						console.error(e)
						res.status(500).json("SUBMISSION NOT RECEIVED! Something went wrong when processing the image as such.");
					}			
				});
			});
		});

		embed.fields.push({name:"Title:",value:fields.title||'-none-',inline:false});
		embed.color = 0x5257d1;
		embed.fields.push({name:"Description:", value: (fields.description||"-none-"), inline: false});
		embed.fields.push({name:"Twitter:", value: fields.twitter||'-none-', inline: false});
		embed.fields.push({name:"Artist Page:", value: fields.page||'-none-', inline: false});
		embed.fields.push({name:"HASH:", value: "`"+file_name+"`", inline: false});
		embed.image = {url: HOST + "/images/artwork/thumbs/"+senderID+"/"+ file_name + '.' + file_ext};


		let embed2 = {}
		embed.color = 0x5257d1
		embed2.fields = embed.fields
		embed2.author = embed.author
		//embed2.description = embed.description
		embed2.color = embed.color
		embed2.title = "🖌 New Fanart Submission"
		embed2.footer = embed.footer
		//embed2.timestamp = embed.timestamp
		embed2.image={url:HOST+"/images/artwork/thumbs/"+senderID+"/"+ file_name + '.' + file_ext}
		sendWebhook({embeds:[embed2]}, "https://discord.com/api/webhooks/789738553037946932/2dn-1c_EzaABoCufkZ-CHMoK7TqHtCm5UGkhGSq6F3p-h0CQ_4je_YPMiyaSUWRjlWQV?wait=true");
		//res.redirect("/artwork");
		//return res.status(200).json("SUBMISSION RECEIVED! It is now pending approval of a moderator... (2)"); 
	});

}


function ensureDirectoryExistence(filePath,recursion=0) {
	if (recursion > 3) return false;

	let dirname = path.dirname(filePath);
	if (fs.existsSync(dirname))  return true;   

	fs.mkdirSync(dirname);
	ensureDirectoryExistence(dirname,recursion++);
}

module.exports = {processForm};