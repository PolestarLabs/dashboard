const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";
const fs = require('fs')
const { Canvas, loadImage } = require('skia-canvas');
const { bgs } = require('/api/schema/schemas/cosmetics');

module.exports = {
    process: async (req,res) => {

        if(!req.user) return res.status(401).json("NOPE");
        const userData = await DB.users.get(req.user.id);
        if (!userData.prime?.active) return res.status(402).json("Prime Not Active"); //or if last rewards was NOW - 3024e9
        
        const canvas = new Canvas(720, 380);
        const ctx = canvas.getContext('2d');

        const [img, watermark] = await Promise.all([
            loadImage(req.body.data),
            loadImage(HOST + "/build/bg-disclaimer-overlay.png").catch(() => null)
        ]);

        ctx.drawImage(img, 0, 0);
        if (watermark) ctx.drawImage(watermark, 0, 0);

        const pngBuffer = await canvas.png;
        await fs.promises.writeFile(`${ASSETS_PATH}/cosmetics/backdrops/${req.user.id}.png`, pngBuffer);
        res.send(pngBuffer);

        PLX.executeWebhook("832619958915694592","oerDKvMDto44S3hE474tyfRI30w0CuQrt-A7H_nSUU77kOKf3inDtn9qJNKwWtBhB4fy",{
            wait: true,
            embeds: [
                {
                    description: `User \`${req.user.id}\` submitted a custom background`,
                    image: {url: `attachment://bg.png` }
                }
            ],
            file:{
                file: pngBuffer,
                name: "bg.png"
            }
        });

        await DB.cosmetics.updateOne({type:'background', code: req.user.id }, {$inc: {version: 1}, $set: { name: `${req.user.username}'s Custom Background`, tags:"CUSTOM", rarity: "XR", type:"background", id: req.user.id, tradeable: false, droppable: false, destroyable: false, event: null } }, {upsert: true} );
    },
    createNew: async (req,res) => {

        if(!req.user) return res.status(401).json("NOPE");
        const userData = await DB.users.get(req.user.id);
        
        if (!userData.prime?.active) return res.status(402).json("Prime not active!");

        const canvas = new Canvas(720, 380);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#121235";
        ctx.fillRect(0, 0, 720, 380);

        await canvas.saveAs(`${ASSETS_PATH}/cosmetics/backdrops/${req.user.id}.png`);

        await Promise.all([
            DB.cosmetics.updateOne({type:'background', code: req.user.id }, {$set: {version: 0, name: `${req.user.username}'s Custom Background`, tags:"CUSTOM", rarity: "XR", type:"background", id: req.user.id, tradeable: false, droppable: false, destroyable: false, event: null } }, {upsert: true} ),
            DB.userInventory.set(req.user.id, {$addToSet: {"bgInventory": req.user.id } })
        ]).then(resp=>{
            res.status(200).json(resp)
        }).catch(err=>{
            console.error(err);
            res.status(500).json("ERROR")
        });

    }
}

module.exports = {
    process: async (req,res) => {

        if(!req.user) return res.status(401).json("NOPE");
        const userData = await DB.users.get(req.user.id);
        if (!userData.prime?.active) return res.status(402).json("Prime Not Active"); //or if last rewards was NOW - 3024e9
        
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
        

        outFile.on('finish', async () =>  {
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
                    file: await canvas.toBuffer(),
                    name: "bg.png"
                }
            })
        })

        await DB.cosmetics.updateOne({type:'background', code: req.user.id }, {$inc: {version: 1}, $set: { name: `${req.user.username}'s Custom Background`, tags:"CUSTOM", rarity: "XR", type:"background", id: req.user.id, tradeable: false, droppable: false, destroyable: false, event: null } }, {upsert: true} );
    },
    createNew: async (req,res) => {

        if(!req.user) return res.status(401).json("NOPE");
        const userData = await DB.users.get(req.user.id);
        
        if (!userData.prime?.active) return res.status(402).json("Prime not active!");

        const canvas = Canvas.createCanvas(720,380);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#121235";
        ctx.fillRect(0,0,720,380);

        const stream = canvas.createPNGStream();
        const outFile = fs.createWriteStream( `${ASSETS_PATH}/cosmetics/backdrops/${req.user.id}.png` );
        stream.pipe(outFile);

        

        await Promise.all([
            DB.cosmetics.updateOne({type:'background', code: req.user.id }, {$set: {version: 0, name: `${req.user.username}'s Custom Background`, tags:"CUSTOM", rarity: "XR", type:"background", id: req.user.id, tradeable: false, droppable: false, destroyable: false, event: null } }, {upsert: true} ),
            DB.userInventory.set(req.user.id, {$addToSet: {"bgInventory": req.user.id } })
        ]).then(resp=>{
            res.status(200).json(resp)
        }).catch(err=>{
            console.error(err);
            res.status(500).json("ERROR")
        });

    }
}