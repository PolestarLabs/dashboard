
// const DB = require('../database')

exports.run = async (req,res)=>{
 const collection= await DB.cosmetics.find({type:'sticker'});
 const stickers= await DB.items.find({type:'boosterpack'});

 res.render('shop/stickers/stickers', {collection,stickers})
}


