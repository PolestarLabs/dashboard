
const express = require('express')
const router = express.Router()
let fullbase;


async function refreshBases(){

  let [bgBase,mdBase,stBase,itBase] = await Promise.all([
    DB.cosmetics.find({type:"background",  tradeable:{$ne: false}  }, {type:1, rarity:1, _id:0, id:1, name:1, price:1, code:1,})
    ,DB.cosmetics.find({type:"medal",      tradeable:{$ne: false}  }, {type:1, rarity:1, _id:0, id:1, name:1, price:1, icon:1,})
    ,DB.cosmetics.find({type:"sticker",    tradeable:{$ne: false}  }, {type:1, rarity:1, _id:0, id:1, name:1, price:1})
  ,DB.items.find(    {                     tradeable:{$ne: false}  }, {type:1, rarity:1, _id:0, id:1, name:1, price:1, icon:1})
 ]);
 bgBase=bgBase.map(itm=> { return {
      name:itm.name,
      img:"/backdrops/"+itm.code+".png",
      id:itm.code,
      type:itm.type,
      rarity:itm.rarity,
      price:itm.price
    }
  })
  mdBase=mdBase.map(itm=> { return {
    name:itm.name,
    img:"/medals/"+itm.icon+".png",
    id:itm.icon,
    type:itm.type,
    rarity:itm.rarity,
    price:itm.price
  }
})
stBase=stBase.map(itm=> { return {

    name:itm.name,
    img:"/build/stickers/"+itm.id+".png",
    id:itm.id,
    type:itm.type,
      rarity:itm.rarity,
      price:itm.price
    }
   })
   itBase=itBase.map(itm=> { return {
     name:itm.name,
      img: itm.type == "boosterpack" ? "/boosters/showcase/"+itm.id.replace("_booster",".png") : "/build/items/"+itm.icon+".png",
      id:itm.id,
      type:itm.type,
      rarity:itm.rarity,
      price:itm.price
    }
   })
   
  
  fullbase = [].concat(bgBase,mdBase,stBase,itBase);

    return {bgBase,mdBase,stBase,itBase,fullbase};
}

refreshBases();


router.get('/', function (req, res) {
  res.render('shop/storefront/_store')
})

router.get(["/backgrounds","/bgs","bgshop"], async function (req, res) {
  delete require.cache[require.resolve('./paginate')];
  
  const bgBase =  await DB.cosmetics.find({type:"background",public:true,exclusive:{$exists:false}}).limit(50);
  console.log(bgBase.length)
  
  res.render('shop/bgshop/bgshop',{
    bgBase,
    pagination: await require('./paginate').run(req,res,null,{
      page:0,
      endpoint:'backgrounds',
      rpp: 70      
    }) 
  })
})

router.get(["/premium","/cash","prime"], async function (req, res) {
  delete require.cache[require.resolve('./paginate')];
  
  const base =  await DB.buyables.find({available:true}).limit(50).lean().exec();
 
  res.render('shop/premium/main',{
    base,
      pagination: await require('./paginate').run(req,res,null,{
      page:0,
      endpoint:'buyables',
      rpp: 50      
    }) 
  }) 
})

router.get("/marketplace", async function (req, res) {
    delete require.cache[require.resolve('./paginate')];      
    await refreshBases();
    req.app.locals.fullbase = fullbase
    let marketplace = await DB.marketplace.find({}).lean().exec();
    let marketeers = await DB.users.find({id:{$in:marketplace.map(i=>i.author)}},{meta:1,id:1}).lean().exec()
    let item, opengraph={};    

    // THIS PIECE IS PROBS DEPRECATED
    if(req.query.ff){
      let ff = req.query.ff
        entry = marketplace.find(x=>x.id==ff)
        let authordata
        if(entry){
          let authordata = marketeers.find(x=>x.id==entry.author);
          let item = fullbase.find(x=> x.id == entry.item_id && x.type == entry.item_type );
          if (item){
            console.log(item)
            opengraph.title = `[${item.rarity}] ${item.name} (${item.type}) `
            opengraph.sitename = ((authordata||{}).meta||{}).tag||"-no author-"
            opengraph.description = `Posted by ${authordata.meta.tag} | <b>Price: ${entry.price} ${entry.currency}</b>`
            opengraph.image = ROOT+item.img
            opengraph.type = "arcticle"
            opengraph.ts = new Date(entry.timestamp).toISOString()
          }
        }
      }
      // await refreshBases();
   
    res.render('shop/marketplace/market',{
    marketplace, fullbase, opengraph,
    sellPages: await require('./paginate').run(req,res,null,{
      page: req.query.p||0,
      endpoint:'marketplace',
      rpp: 25,
    })
  })
})

router.get("/marketplace/entry/:id", async function (req, res, _404) {
  let ff = req.params.id  
  let entry = await DB.marketplace.findOne({id:ff}); 
  if(!entry) return _404();

  let [marketplace,prefbase] = await Promise.all([
     DB.marketplace.aggregate([
       {$match: {$or: [{author: entry.author}, {item_id: entry.item_id }] } },
   {$project: {			
       item_id: {$convert: {input: "$item_id",to:"objectId", onError:null} }
       ,type:1,item_type:1,price:1,currency:1,author:1,id:1,timestamp:1
   }},
   {$lookup: {from:"userdb",localField:"author",foreignField:"id",as:"userdata"}},	
   {$lookup: {from:"cosmetics",localField:"item_id",foreignField:"_id",as:"cosdata"}},
   {$lookup: {from:"items",localField:"item_id",foreignField:"_id",as:"junkdata"}},

   {$unwind: "$userdata"},
   {$project: {id:0,type:1,item_id:1,item_type:1,price:1,currency:1,author:1,id:1,timestamp:1, 
       itemdata:{
           $setUnion: ["$cosdata","$junkdata"]
       },
       junkdata:1,cosdata:1, userdata:{meta:1}}
   },
   {$unwind: "$itemdata"},{
       $project: {
           type:1,item_id:1,item_type:1,price:1,currency:1,author:1,id:1,timestamp:1, 
           userdata:1,
           itemdata: {
               id:1,code:1,icon:1,rarity:1,name:1,event:1,series:1,BUNDLE:1,
               img :{
                   $switch:{
                       branches: [
                           {
                               case: { $eq: ['$item_type' , 'background'] },
                               then: { $concat: [ "/backdrops/","$itemdata.code",".png" ] }
                           },                                        
                           {
                               case: { $eq: ['$item_type' , 'medal'] },
                               then: { $concat: [ "/medals/","$itemdata.icon",".png" ] }
                           },                                        
                           {
                               case: { $eq: ['$item_type' , 'sticker'] },
                               then: { $concat: [ "/build/stickers/","$itemdata.id",".png" ] }
                           },                                                                            
                           {
                               case: { $eq: ['$item_type' , 'boosterpack'] },
                               then: { $concat: [ "/boosters/showcase/","$itemdata.icon",".png" ] }
                           },                                        
                       ],
                       default: { $concat: [ "/build/items/","$itemdata.icon",".png" ] }
                   }
               }
           },
       }
   },
   { $project: {_id:0,junkdata:0,cosdata:0,} },
  ]),
     {}
  ]);

  let listings = marketplace.filter(it=>it.item_id == entry.item_id);
  let morefrom = marketplace.filter(it=>it.author == entry.author);
  entry = listings.find(x=>x.id==entry.id)

  if (entry) {
    let item = entry.itemdata // fullbase.find(it=> it.id == entry.item_id && it.type == entry.item_type);
    if (item) {
      
      let fullbase = prefbase.fullbase;

      let opengraph={}
      let defrarity = {
        C:   "⭐",
        U:   "⭐⭐", 
        R:   "⭐⭐⭐", 
        SR:  "⭐⭐⭐⭐",
        UR : "⭐⭐⭐⭐⭐",
        XR : "⭐⭐⭐⭐⭐⭐⭐"
      }[item.rarity];
      opengraph.title = `[${entry.item_type.toUpperCase()}] ${item.name} ${defrarity}`
      //opengraph.sitename = ((entry.userdata||{}).meta||{}).tag||"-no author-"
      opengraph.sitename = "POLLUX MARKETPLACE"
      opengraph.description = `📬 ${entry.userdata.meta.tag} | <b>🏷️ ${entry.price} ${entry.currency}</b>`
      opengraph.image = HOST+item.img
      opengraph.type = "arcticle"

      res.render('shop/marketplace/entry', {listings,item,entry,fullbase,morefrom,opengraph})

    }else{

      console.log('noitemu');
      return _404();
    }
  }else{
    
    console.log('noentry');
    return _404();
  }
})

// POST

module.exports = router



