const Canvas = require('canvas')
 
const express = require('express');
const router = express.Router();
 
const Discoin = require('../../structures/Discoin.js');
const DSC = new Discoin("")


const Canvas = require('canvas')

function tag(base, text,font,color) {

    font =  font || '600 18px "Corporate Logo Rounded"'
    color = color || '#fff'
    base.font = font;

    let H = base.measureText(text).emHeightAscent
    let h = base.measureText(text).emHeightDescent;
    let w = base.measureText(text).width+20;
    const item = new Canvas.createCanvas(w, h + H);
        let c = item.getContext("2d")
        c.antialias = 'subpixel';
        c.filter = 'best';
        c.font = font;
        c.fillStyle = color;
        c.fillText(text, 0, H);
    return item;
}


router.get('/exchange.png', async (req,res)=>{
    
    
    const canvas = Canvas.createCanvas(500,500);
    const ctx = canvas.getContext('2d')
    try{

        const Transaction = JSON.parse(await DSC.info(req.query.id));
        const isRBN = !!(Transaction.to.id == 'RBN' || req.query.plxin != undefined)
        
        const BG= await Canvas.loadImage(HOST+`/build/discoin/${isRBN?"mainframe_plxin":"mainframe"}.png`);
        const CR= await Canvas.loadImage(HOST+`/build/discoin/${Transaction.to.id}mini.png`);
        const QR= await Canvas.loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("https://dash.discoin.zws.im/#/transactions/"+req.query.id+"/show")}`);
        
        const TAX = (100-(req.query.tax || 15)) / 100;
        const true_amount = Number(Transaction.amount) / TAX;
        
        ctx.translate(250,250)
        ctx.rotate(-.07)
        ctx.translate(-250,-250)
        ctx.translate(30,30)
        ctx.scale(0.88, 0.88)
        ctx.shadowBlur = 15
        
        ctx.drawImage(BG,0,0)
        ctx.globalAlpha = .7
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(QR,324, 258)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-atop'
        ctx.drawImage(tag(ctx,Transaction.user,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,145)
        
        ctx.drawImage(CR, 22,193)
        ctx.drawImage(tag(ctx,Transaction.to.name,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22+38,198)
        ctx.drawImage(tag(ctx,Transaction.to.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),427,193)
        
        ctx.drawImage(tag(ctx,(true_amount.toFixed(3))+" "+Transaction.from.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,246)
        
        if(isRBN){
            ctx.drawImage(tag(ctx,Math.floor(Number(Transaction.payout))+" "+Transaction.to.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,296)
            ctx.drawImage(tag(ctx,((req.query.tax||15)+"%"),' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,338)
            ctx.drawImage(tag(ctx,Math.floor(Transaction.payout*TAX)+" "+Transaction.to.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,384)
        }else{
            ctx.drawImage(tag(ctx,((req.query.tax||15)+"%"),' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,296)
            ctx.drawImage(tag(ctx,Math.floor(Number(Transaction.amount))+" "+Transaction.from.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,338)
            ctx.drawImage(tag(ctx,Math.floor(Transaction.payout)+" "+Transaction.to.id,' 600 14pt "Merchant Copy Doublesize"','#2b2b3b'),22,384)
        }
        
        let transactionID = tag(ctx,Transaction.id,'300 12pt "Merchant Copy Doublesize"','#2b2b3b');
        let date = tag(ctx,Transaction.timestamp,'300 10pt "Merchant Copy Doublesize"','#2b2b3b');
        ctx.drawImage(transactionID,250-transactionID.width/2,437)
        ctx.drawImage(date,250-date.width/2,466)
        
    }catch(err){
        const ERR= await Canvas.loadImage(HOST+`/build/discoin/ERROR.png`);
        ctx.translate(250,250)
        ctx.rotate(-.07)
        ctx.translate(-250,-250)
        ctx.translate(30,30)
        ctx.scale(0.88, 0.88)
        ctx.shadowBlur = 15
        
        ctx.drawImage(ERR,0,0)
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(tag(ctx,"*Â£ÏŸþEñ£þ½þ|ÿ ò+ÿ ÊA",' 600 14pt "Merchant Copy Doublesize", mono','#2b2b3b'),30,193)
        ctx.drawImage(tag(ctx,"₢AÔÕÖ×ØÙÚâãäåæçèéêò",' 600 14pt "Merchant Copy Doublesize", mono','#2b2b3b'),30,293)
        ctx.drawImage(tag(ctx,"#B±ÁRÑð•–—˜™š¢£¤¥¦§¨©ª²³",' 600 14pt "Merchant Copy Doublesize", mono','#2b2b3b'),30,393)
    }
        
        res.status(200).header('Content-Type','image/png').send( await canvas.png );
        
})

module.exports = router