const ECO = require("../../../pipelines/economy.js");
const express = require("express");
const router = express.Router();

/*

  CONTENTS:

      GET / 
      GET /rates ----------------------- must move to top-level
      GET /:item
      
      POST / 
      
      DELETE /:entry *
      
      PATCH /:entry *


*/

// ROOT
router.get("/", cache(60), async (req, res) => {
  let queries = {};
  Object.keys(req.query)
    .filter((qry) =>
      ["id", "item_id", "item_type", "author", "type", "price"].includes(qry)
    )
    .forEach((ky) => {
      queries[ky] = req.query[ky];
    });

  if (req.query.after) {
    queries.timestamp = {
      $gte: Number(req.query.after) || Date.now() - 86400000,
    };
  }
  if (req.query.before) {
    queries.timestamp = { $lte: Number(req.query.before) || Date.now() };
  }

  let lim = Math.min(Number(req.query.limit) || 25, 100);
  let skip = Number(req.query.skip) || 0;
  let sort = req.query.sort == "oldest" ? 1 : -1;

  DB.marketplace
    .find(queries, { __v: 0 })
    .sort({ timestamp: sort })
    .limit(lim)
    .skip(skip)
    .then(async (result) => {
      let [marketeers, cosmetics, goods] = await Promise.all([
        DB.users
          .find(
            { id: { $in: result.map((i) => i.author) } },
            { meta: 1, id: 1 }
          )
          .lean()
          .exec()
          .catch((e) => []),
        DB.cosmetics
          .find({ _id: { $in: result.map((i) => i.item_id) } })
          .lean()
          .exec()
          .catch((e) => []),
        DB.items
          .find({ _id: { $in: result.map((i) => i.item_id) } })
          .lean()
          .exec()
          .catch((e) => []),
      ]).catch((err) => {
        console.error(result.map((i) => i.item_id));

        res.status(500).send("ERROR");
      });

      let newThing = result.map((entry) => {
        return Object.assign(
          {
            itemdata: cosmetics
              .concat(goods)
              .find((i) => i._id == entry.item_id),
          },
          { userdata: marketeers.find((u) => u.id === entry.author).meta },
          entry._doc
        );
      });

      res.json(newThing);
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send("What the fuck are you trying?");
    });
});

// RATES
router.get("/rates", async (req, res) => {
  // TODO[epic=flicky] Move Global Numbers & Rates to Database ?
  const { bgPrices, medalPrices,sapphireModifier, jadeModifier } = require( process.env.BOT_PATH + "/resources/lists/GlobalNumbers.js");
  return res.json({ bgPrices, medalPrices, sapphireModifier, jadeModifier });
});

// ITEM INFO
// - takes an ObjectID
router.get("/:item", async (req, res) => {
  const { item } = req.params;

  getItemMarketDetails(item)
    .catch((code, reason) => {
      res.status(code).json({ reason });
    })
    .then((response) => {
      res.json(response);
    });
});

// POST NEW ENTRY
/*
  Payload:
    type = [sell | buy]
    author = userID
    currency = [RBN | SPH]
    price = INTEGER > 0
      --> TO-DO: >> must check for rotation and retail prices in the future
    pollux = Bot Request Validator 
*/
router.post("/", async (req, res) => {
  const DATA = req.body;
  const PAYLOAD = req.body.pollux ? req.body.LISTING : req.body;

  // VALIDATION
  if (!PAYLOAD) return res.status(400).json("No Listing Supplied");
  if (PAYLOAD.pollux && !PAYLOAD.author && !req.user)
    return res.status(401).json("No Author Supplied");
  if (req.user) PAYLOAD.author = req.user.id;

  PAYLOAD.id = (Date.now()).toString(16).toUpperCase()+process.pid;
  PAYLOAD.timestamp = Date.now();

  let {item} = (await getItemMarketDetails(PAYLOAD.item_id)); 

  if (PAYLOAD.type == "sell") {
    let result = await userCanSell(
      PAYLOAD.author,
      PAYLOAD.currency,    
      item
    );
    if (result.res === true) {
      await DB.users.updateOne(
        (DATA.itemStatus || {}).prequery ||
          result.prequery || { id: PAYLOAD.author },
        (DATA.itemStatus || {}).query || result.query
      );
    } else {
      return res.status(result.status).json(result.reason);
    }
  } else if (PAYLOAD.type == "buy") {
    let result = await userCanBuy(
      PAYLOAD.author,
      PAYLOAD.currency,
      PAYLOAD.price,
      item,
    );
    if (result.res === true) {
      await ECO.pay(
        PAYLOAD.author,
        Math.abs(PAYLOAD.price),
        "marketplace_buy",
        PAYLOAD.currency
      );
    } else {
      return res.status(result.status).json(result.reason);
    }
  } else {
    return res.status(400).json("Listing Type Not Set");
  }

  await DB.marketplace.new(PAYLOAD);

  return res.status(200).json({ status: "OK", payload: PAYLOAD });

  //res.redirect('/shop/marketplace')
});


async function awardMarketplaceItem(item,userID,remove){
  let query = {};
  let finder = {id: userID}
  let operation = remove ? "$pull" : "$addToSet";

  switch(item.type){
    case "background":
      query[operation]= {'modules.bgInventory': item.code};
      break;
    case "medal":
      query[operation]= {'modules.medalInventory': item.icon};
      break;
    case "sticker":
      query[operation]= {'modules.stickerInventory': item.id};
      break;
    case "flair":
      query[operation]= {'modules.stickerInventory': item.id};
      break;
    default:       
      finder['modules.inventory.id'] = item.id;
      query = {$inc: {'modules.inventory.$.count': (remove ? -1 : 1) } };
  }
  let res = await DB.users.set( finder, query ).catch(err=>null);
  console.log({finder, query})
  console.log(res)
  if (res) return true;
  else return false;
}

// BUY FROM ENTRY
router.post("/buy/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;
    
  
  let CURRENT_USER;
  if(!req.user) {    
    if ( "Bot " + req.body?.token === PLX.token) CURRENT_USER = req.body.user;
    else return res.status(403).json({status: "LARIS TOKEN MISMATCH"});
  }else{CURRENT_USER = req.user}
  if (!CURRENT_USER)  return res.status(401).json({status: "CURRENT_USER MISSING"});


  let entry = await DB.marketplace.findOne({ id: entry_id }).noCache().lean();

    
  if(entry.completed) return res.status(410).json({status: "LISTING HAS BEEN TERMINATED"});
  if(entry.lock) return res.status(409).json({status: "ENTRY IS LOCKED"});

  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  if(entry.author === CURRENT_USER.id) return  res.status(403).json({status: "NOT ALLOWED"});
  if(entry.type !== 'sell') return res.status(403).json({status: "ITEM FOR SALE-ONLY"});

  let {item} = (await getItemMarketDetails(entry.item_id)); 
  let canBuy = await userCanBuy(CURRENT_USER.id,entry.currency,entry.price,item);
  
  if(!canBuy.res) return res.status(canBuy.status).json({canBuy,item});

  await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: true}});
  let sale = await awardMarketplaceItem(item,CURRENT_USER.id,false);
  
  if(sale) {
    ECO.transfer(CURRENT_USER.id,entry.author,entry.price,'MARKETPLACE [BUY/SOLD]',entry.currency)
    .then(async receipt=>{
      await DB.marketplace.updateOne({ id: entry_id },{$set: {completed: true}});
      return res.status(200).json({status:'OK',receipt})
    }).catch(async err=>{
      await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: false}});
      return res.status(500).json({status:'ERROR DURING PAYMENT PHASE'})
    });
  }else{
    await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: false}});
    return res.status(500).json({status:'ERROR:SALE_INVALID'})
  }

})

// SELL FROM ENTRY
router.post("/sell/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;
  

  let CURRENT_USER;
  if(!req.user) {    
    if ( "Bot " + req.body?.token === PLX.token) CURRENT_USER = req.body.user;
    else return res.status(403).json({status: "LARIS TOKEN MISMATCH"});
  }else{CURRENT_USER = req.user}
  if (!CURRENT_USER)  return res.status(401).json({status: "CURRENT_USER MISSING"});


  let entry = await DB.marketplace.findOne({ id: entry_id }).noCache().lean();
  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  
  if(entry.completed) return res.status(410).json({status: "LISTING HAS BEEN TERMINATED"});
  if(entry.lock) return res.status(409).json({status: "ENTRY IS LOCKED"});
  
  if(entry.type )
  if(entry.author === CURRENT_USER.id) return  res.status(403).json({status: "NOT ALLOWED"});
  if(entry.type !== 'buy') return res.status(403).json({status: "ITEM FOR PURCHASE-ONLY"});


  let {item} = (await getItemMarketDetails(entry.item_id)); 
  
  // User can sell TO marketplace? 
  // conditions:
  //  • must have item
  //  • must have 10 RBN

  let canSell = await userCanSell(CURRENT_USER.id,entry.currency,item,true);
  
  

  if(!canSell.res) return res.status(canSell.status).json({canSell,item});
  await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: true}});
  
  let sale = await awardMarketplaceItem(item,CURRENT_USER.id,true);

  if(sale) {
    ECO.arbitraryAudit(entry.author, CURRENT_USER.id, entry.price, 'MARKETPLACE [SELL/BOUGHT]', entry.currency)
    .then(async receipt=>{
      await DB.users.set(CURRENT_USER.id, {$inc: {["modules." + entry.currency]:entry.price} });
      await DB.marketplace.updateOne({ id: entry_id },{$set: {completed: true}});
      
      //TODO[epic=anyone] Emit notification to the seller;

      return res.status(200).json({status:'OK',receipt,sale})
    }).catch(async err=>{
      console.error(err)
      await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: false}});
     return res.status(500).json({status:'ERROR DURING PAYMENT PHASE'})
    });
  }else{
    await DB.marketplace.updateOne({ id: entry_id },{$set: {lock: false}});
   return res.status(500).json({status:'ERROR:SALE_INVALID'})
  }

})

// DELETE ENTRY (Restores Item)
router.delete("/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;

  let entry = await DB.marketplace.findOne({ id: entry_id }).lean();
  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  if(entry.author !== req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  let item = await getItemMarketDetails(entry.item_id);
  
  destroyEntry(entry_id).then(async result=>{
    await awardMarketplaceItem(item,req.user.id,false);
    res.status(result.status).json(result.json)
  });
})


// EDIT ENTRY (Price-Only)
router.patch("/:entry", async (req,res)=>{
  const {entry} = req.params;
  const {price} = req.body;
  if(!entry || !price) return res.status(404).json({status: "ENTRY/PRICE NOT SPECIFIED"});

  let item = await DB.marketplace.findOne({ id: entry }).lean();
  if(!item) res.status(404).json({status: "ENTRY NOT FOUND"});
  if(item.author !== req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  DB.marketplace.updateOne({ id: entry } , {$set: {price} }).lean().then((r) => {
    if(r.nModified) res.status(200).json({updated: r.nModified, status: "OK"});
    else res.status(410).json({status: "Nothing to update"});
  }).catch(err=>{
    console.error(err);
    res.status(500).json({status: "ERROR"});
  })
})

function destroyEntry(entry) {
  let status, json;
  return DB.marketplace.remove({ id: entry }).lean().then((r) => {
    if (r.deletedCount){
      status = 200;
      json ={ removed: r.deletedCount, status: "OK" };
    }else{
      status = 410;
      json = { status: "Nothing to remove" };
    }
    return {status,json}
  }).catch(err => {
    console.error(err);
    status = 500;
    json = { status: "ERROR" };
    return {status,json}
  });
}

function getItemMarketDetails(item) {
  return new Promise(async (resolve, reject) => {
    const [cos, itm] = await Promise.all([
      DB.cosmetics.find({ _id: item }).lean().exec(),
      DB.items.find({ _id: item }).lean().exec(),
    ]).catch(async () => {
      return await Promise.all([
        DB.cosmetics
          .find({ $or: [{ id: item }, { icon: item }, { code: item }] })
          .lean()
          .exec(),
        DB.items.find({ id: item }).lean().exec(),
      ]).catch((e) => {
        return reject(400, "Bad Request");
      });
    });
    const result = cos.concat(itm)[0];
    if (!result) return reject(404, "item not found");
    const marketplace = await DB.marketplace
      .find({ item_id: result._id })
      .noCache()
      .lean()
      .exec();
    const marketplacePriceMap = marketplace.map(
      (x) => (x.currency === "SPH" ? 1000 : 1) * x.price
    );

    const response = {
      item: result,
      max: Math.max(...marketplacePriceMap),
      min: Math.max(...marketplacePriceMap),
      average:
        marketplacePriceMap.reduce((a, b) => a + b, 0) / marketplace.length,
      entries: marketplace,
    };
    return resolve(response);
  });
}

// might need refactor
function itemInInventory(item, userData) {
  let res = false;
  let reason = "UNKNOWN";
  let status = 400;
  let query = {};
  let prequery = {};


  if (item.type === "boosterpack")
    item_shallow_id = item_shallow_id + "_booster";

  if (["junk", "boosterpack", "key", "material", "consumable"].includes(item.type)){
    if (userData.amtItem(item.id) == 0 ) {
      res = false;
      reason = "ITEM NOT IN INVENTORY";
      status = 404;
    }else{
      res = true;
      prequery = { id: userData.id, "modules.inventory.id": item.id };
      query = { $inc: { "modules.inventory.$.count": -1 } };
    }
  }
  if (item.type === "background") {
    if (!userData.modules.bgInventory.includes(item.code)) {
      res = false;
      reason = "BACKGROUND NOT IN INVENTORY";
      status = 404;
    }
    else {
      query = { $pull: { "modules.bgInventory": item.code } };
      res = true;
    }
  }
  if (item.type === "medal") {
    if (!userData.modules.medalInventory.includes(item.icon)) {
      res = false;
      reason = "MEDAL NOT IN INVENTORY";
      status = 404;
    }
    else {
      query = { $pull: { "modules.medalInventory": item.icon } };
      res = true;
    }
  }
  if (item.type === "skin") {
    if (!userData.modules.skinInventory.includes(item.id)) {
      res = false;
      reason = "SKIN NOT IN INVENTORY";
      status = 404;
    }
    else {
      query = { $pull: { "modules.skinInventory": item.id } };
      res = true;
    }
  }
  if (item.type === "sticker") {
    if (!userData.modules.stickerInventory.includes(item.id)) {
      res = false;
      reason = "STICKER NOT IN INVENTORY";
      status = 404;
    }
    else {
      query = { $pull: { "modules.stickerInventory": item.id } };
      res = true;
    }
  }
  return { res, reason, status, query , prequery};
}
// might need refactor
async function userCanSell(id, currency, item, softCheck=false) {
  if (!(await DB.users.get(id)))
    return { res: false, reason: "USER NOT FOUND", status: 401 };
  if (!(await ECO.checkFunds(id, currency === "SPH" ? 2 : 300, currency)))
    return { res: false, reason: "NO INITIAL FUNDS", status: 422 };

  const userData = await DB.users.findOne({id}).noCache();

  // Check item in inventory.
  // Positive if
  //  • item is in inventory

  let { res, reason, status, prequery, query } = itemInInventory(item, userData);
 
  if (!softCheck && userData.amtItem("sph-license") < 1 && currency === "SPH") {
    res = false;
    reason = "NO SAPPHIRE LICENSE";
    status = 401;
  }

  if( !isTradeable(item) ){
    res = false;
    reason = "ITEM IS NOT TRADEABLE";
    status = 403;
  };

  return { res, reason, status, query, prequery };
}
// might need refactor
async function userCanBuy(userId, currency, price, item) {
  let res = true,
    reason = "UNKNOWN",
    status = 200;

  const userData = await DB.users.findOne({id:userId}).noCache();
  let itemInInv = itemInInventory(item, userData);

  if( itemInInv.res ){
    if(['background','medal','sticker','flair','skin'].includes(item.type)){     
      res = false;
      reason = "ITEM ALREADY OWNED";
      status = 403;
    }
  }  else if (!(await ECO.checkFunds(userId, price, currency))) {
    res = false;
    reason = "NO FUNDS";
    status = 422;
  } else {   
    if( !isTradeable(item) ){
      res = false;
      reason = "ITEM IS NOT TRADEABLE";
      status = 403;
    };
  }

  return { res, reason, status };
}
// might need refactor
function isTradeable(item){
  return  ( true || item?.tradeable )  // TEMP SWITCH OFF
}


module.exports = router;
