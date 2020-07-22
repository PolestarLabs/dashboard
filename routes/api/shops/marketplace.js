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
      console.log(result);
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

router.get("/rates", async (req, res) => {
  const { bgPrices, medalPrices,sapphireModifier, jadeModifier } = require("../../../../bot/GlobalNumbers.js");
  return res.json({ bgPrices, medalPrices, sapphireModifier, jadeModifier });
});

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
        "Marketplace Buy Listing",
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


router.post("/buy/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;

  if(!req.user) return res.send(403);

  let entry = await DB.marketplace.findOne({ id: entry_id }).lean();
  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  //if(entry.author === req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  let {item} = (await getItemMarketDetails(entry.item_id)); 
  let canBuy = await userCanBuy(req.user.id,entry.currency,entry.price,item);
  
  if(!canBuy.res) return res.status(canBuy.status).json({canBuy,item});




  res.json({item,canBuy})

  /*

  TO-DO:  test item against type then fork?

  */
})


async function awardMarketplaceItem(item,user){}


router.post("/sell/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;

  let entry = await DB.marketplace.findOne({ id: entry_id }).lean();
  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  if(entry.author === req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  let item = await getItemMarketDetails(entry.item_id);

  /*

  TO-DO:  test item against type then fork?

  */


})


router.delete("/:entry_id", async (req,res)=>{
  const {entry_id} = req.params;

  let entry = await DB.marketplace.findOne({ id: entry_id }).lean();
  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
  if(entry.author !== req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  let item = await getItemMarketDetails(entry.item_id);
  /*

  TO-DO:  test item against type then fork?

  */

  
  destroyEntry(entry_id).then(result=>{
    
    res.status(result.status).json(result.json)
  });
})


  /*

  TO-DO:  catch-all procedure for buy/sell/delete

  types: background, skin, flair, medal => respective collection ($addToSet)
  anything else: goest to user > inventory ($inc by item ID )

  */








router.patch("/:entry", async (req,res)=>{
  const {entry} = req.params;
  const {price} = req.body;
  if(!entry || !price) return res.status(404).json({status: "ENTRY/PRICE NOT SPECIFIED"});

  let item = await DB.marketplace.findOne({ id: entry }).lean();
  if(!item) res.status(404).json({status: "ENTRY NOT FOUND"});
  if(item.author !== req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  DB.marketplace.updateOne({ id: entry } , {$set: {price} }).lean().then((r) => {
    console.log(r)
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

function itemInInventory(item, userData) {
  let res = false;
  let reason = "UNKNOWN";
  let status = 400;
  let query = {};
  let prequery = {};

  if (item.type === "boosterpack")
    item_shallow_id = item_shallow_id + "_booster";


  if (userData.amtItem(item.id) == 0 &&
    ["junk", "boosterpack", "key", "material", "consumable"].includes(item.type)) {
    res = false;
    reason = "ITEM NOT IN INVENTORY";
    status = 404;
    prequery = { id: userData.id, "modules.inventory.id": item.id };
    query = { $inc: { "modules.inventory.$.count": -1 } };
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

async function userCanSell(id, currency, item) {
  if (!(await DB.users.get(id)))
    return { res: false, reason: "USER NOT FOUND", status: 401 };
  if (!(await ECO.checkFunds(id, currency === "SPH" ? 2 : 300, currency)))
    return { res: false, reason: "NO FUNDS", status: 422 };

  const userData = await DB.users.get(id);

  let { res, reason, status, prequery, query } = itemInInventory(item, userData);
 
  if (userData.amtItem("sph-license") < 1 && currency === "SPH") {
    res = false;
    reason = "NO SAPPHIRE LICENSE";
    status = 401;
  }

  ({ res, reason, status,  } = await isTradeable(
    item.type, item._id,
    res,    reason,    status
  ));

  return { res, reason, status, query, prequery };
}

// might need refactor
async function userCanBuy(userId, currency, price, item) {
  let res = true,
    reason = "UNKNOWN",
    status = 200;

  const userData = await DB.users.findOne({id:userId});
  let itemInInv = itemInInventory(item, userData);
  console.log(itemInInv)
  if( itemInInv.res ){
    if(['background','medal','sticker','flair','skin'].includes(item.type)){     
      res = false;
      reason = "ITEM ALREADY OWNED";
      status = 403;
    }
  }
  else if (!(await ECO.checkFunds(userId, price, currency))) {
    res = false;
    reason = "NO FUNDS";
    status = 422;
  } else {
    ({ res, reason, status } = await isTradeable(
      item.type,
      item._id,
      res,
      reason,
      status
    ));
  }

  return { res, reason, status };
}

async function isTradeable(item) {
  let res = true, reason="NONE", status=200;
  let target_db = ["background", "medal", "sticker", "flair", "skin"].includes(item.type)
    ? "cosmetics"
    : "items";
  let item = await DB[target_db]
    .find({ _id: item._id })
    .lean()
    .catch((e) => null);
  console.log(item)
  if (false && !item?.tradeable) { // TEMP SWITCH OFF
    res = false;
    reason = "ITEM IS NOT TRADEABLE";
    status = 403;
  }else{
    reason= "OK"
  }
  return { res, reason, status };
}

module.exports = router;
