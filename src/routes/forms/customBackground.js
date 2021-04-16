const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";
const fs = require('fs')
const Canvas = require('canvas');
const { bgs } = require('@polestar/database_schema/schemas/cosmetics');

module.exports = {
    process: async (req,res) => {

        if(!req.user) return res.status(401).json("NOPE");
        const userData = await DB.users.get(req.user.id);
        if (!userData.donator) return res.status(402).json("NOPE"); //or if last rewards was NOW - 3024e9
        
        const canvas = Canvas.createCanvas(720,380);
        const ctx = canvas.getContext('2d');
        const img = new Canvas.Image();
        const watermark = await Canvas.loadImage(HOST+"/build/bg-disclaimer-overlay.png").catch(e=> null);
        img.src = req.body.data;
        
        ctx.drawImage(img,0,0);
        watermark ? ctx.drawImage(watermark,0,0) : null;
        
        
        const stream = canvas.createPNGStream();
        const outFile = fs.createWriteStream( `${ASSETS_PATH}/cosmetics/backdrops/${req.user.id}.png` );
                
        stream.pipe(outFile);
        stream.pipe(res);

        outFile.on('finish', () =>  {
            console.log("• ".green + 'Custom BG Saved!');
            PLX.executeWebhook("832619958915694592","oerDKvMDto44S3hE474tyfRI30w0CuQrt-A7H_nSUU77kOKf3inDtn9qJNKwWtBhB4fy",{
                wait: true,
                embeds: [
                    {
                        description: `User \`${req.user.id}\` submitted a custom background`,
                        image: {url: `attachment://bg.png` }
                    }
                ],
                file:{
                    file: canvas.toBuffer(),
                    name: "bg.png"
                }
            })
        })
    }
}