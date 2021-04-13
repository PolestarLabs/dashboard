const ECO = require("../../../pipelines/economy.js");
const express = require("express");
const router = express.Router();
const config = require("../../../../config.js");
const marketHook = config.webhooks.marketplace;
const axios = require('axios');

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

// RATES
router.get("/rates", async (req, res) => {
  // TODO[epic=flicky] Move Global Numbers & Rates to Database ?
  const { bgPrices, medalPrices,sapphireModifier, jadeModifier } = require( process.env.BOT_PATH + "/resources/lists/GlobalNumbers.js");
  return res.json({ bgPrices, medalPrices, sapphireModifier, jadeModifier });
});

router.get(["/","/:entry"], cache(60), async (req, res) => {
  let queries = {};
  if (req.params.entry) req.query.id = req.params.entry;
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
  let skip = Number(req.query.skip) || (Number(req.query.page) * 25) || 0;
  let sort = req.query.sort == "oldest" ? 1 : -1;

  DB.marketplace
    .find(queries, { __v: 0 })
    .sort({ timestamp: sort })
    .limit(lim)
    .skip(skip)
    .then(async (result) => {
      let [marketeers, cosmetics, goods] = await Promise.all([
        /*DB.users
          .find(
            { id: { $in: result.map((i) => i.author) } },
            { meta: 1, id: 1 }
          ).lean()
          .catch((e) => []),*/
        Promise.all(result.map(async (i) => await userCache.get(i.author))),
        DB.cosmetics
          .find({ _id: { $in: result.map((i) => i.item_id) } }).lean()
          .catch((e) => []),
        DB.items
          .find({ _id: { $in: result.map((i) => i.item_id) } }).lean()
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
          { userdata: marketeers.find((u) => u.id === entry.author) },
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

// ITEM INFO
// - takes an ObjectID
router.get("/item/:item", async (req, res) => {
  const { item } = req.params;
  getItemMarketDetails(item)
    .catch(({status,info}) => {
      res.status(status).json({ status,info });
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
  const userDiscordData = await userCache.get(PAYLOAD.author);
console.log({userDiscordData},PAYLOAD.author,typeof userDiscordData)
  
  PAYLOAD.id = (Date.now()).toString(16).toUpperCase()+process.pid;
  PAYLOAD.timestamp = Date.now();
  
  //let {item} = (await getItemMarketDetails(PAYLOAD.item_id)); 
  const itemMarketDetails = await getItemMarketDetails(PAYLOAD.item_id).catch(e=>e); 
  let {item: ITEM,status,info} = itemMarketDetails;
  
  PAYLOAD.item_type = ITEM.type;
  if (!ITEM) return res.status(status).json(info);

  if (PAYLOAD.type == "sell") {
    let result = await userCanSell(
      PAYLOAD.author,
      PAYLOAD.currency,    
      ITEM
    );
    if (result.res === true) {
      const finder = (DATA.itemStatus || {}).prequery || result.prequery || { id: PAYLOAD.author };
      const action = (DATA.itemStatus || {}).query || result.query;

      if (finder === {}) return res.status(400).json("Dangerous Query Result");
      await DB.users.updateOne(finder,action);

    } else {
      return res.status(result.status).json(result.reason);
    }
  } else if (PAYLOAD.type == "buy") {
    let result = await userCanBuy(
      PAYLOAD.author,
      PAYLOAD.currency,
      PAYLOAD.price,
      ITEM,
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

  const pathAssociations = (itm) => {
    switch (itm.type) {
      case "background":
        return ['backgrounds',itm.code];
      case "medal":
        return ['medals',itm.icon];
      case "sticker":
        return ['stickers',itm.id];
      case "boosterpack":
        return ['items',itm.icon];

      default:
        return ['items',itm.id];
    }
  }

  PAYLOAD.img = `/${pathAssociations(ITEM)[0]}/${pathAssociations(ITEM)[1]}.png`;

  await DB.marketplace.new(PAYLOAD);

  PAYLOAD.url = `${HOST}/shop/marketplace/entry/${PAYLOAD.id}`

  const reputation = (await axios.get(`${HOST}/api/user/${PAYLOAD.author}/commends`).catch(e=>null))?.data || {};

  //PLX.executeWebhook(marketHook.id,marketHook.token,{
  PLX.createMessage( marketHook.channel, {
    //auth: true,
    content: "<:onlinestore:446901835715051531> • **New marketplace post!** Check it out before it is gone!",
    embed: 
      {
        
          description: ` \`${PAYLOAD.type.toUpperCase() + "ING"}\`  ${_emoji(ITEM.rarity)}**[${ITEM.name}](${PAYLOAD.url})** for ${_emoji(PAYLOAD.currency)}**${PAYLOAD.price}**\n`+
          `\n${_emoji('CTK')} **Player Reputation:** ${reputation.totalIn||0}`,
          author: {
            name: `${userDiscordData.username} posted a new Marketplace listing`,
            icon_url: userDiscordData.avatarURL,
            url: PAYLOAD.url
          },
          
          color: PAYLOAD.type == "sell" ?  0xFF3355 : 0xA853FA,
          thumbnail: {
            url: HOST + PAYLOAD.img
          },
          fields: [
            {
              name: "Min",
              value: `${ itemMarketDetails.min ||0 }`,
              inline: true
            },
            {
              name: "Max",
              value: `${ itemMarketDetails.max ||0 }`,
              inline: true
            },
            {
              name: "Market Average",
              value: `${ ~~(itemMarketDetails.average) || "??" }`,
              inline: true
            },/*
            {
              name: "\u200b",
              value: `ID: \`${PAYLOAD.id}\``,
              inline: false
            }*/
          ],
          footer: {
            text: `[ 📦 ${ 
              itemMarketDetails.entries?.filter(x=>x.type=='sell')?.length ||0
            } Selling | 🛒 ${ 
              itemMarketDetails.entries?.filter(x=>x.type=='buy')?.length ||0
            } Buying ] ${(itemMarketDetails.entries?.length || 0)} previous entries of this item`
          },
          timestamp: new Date(PAYLOAD.timestamp)
        
      }
    ,
    //wait: true
  }).then(async msg=>{
      const messageChannel = await PLX.getRESTChannel('792176688070918194');
      await DB.marketplace.updateOne({id: PAYLOAD.id},{$set:{feedMessage: [msg.channel.id,msg.id] }});
      //if (messageChannel.type !== 5 ) return;
      //await PLX.crosspostMessage(msg.channel.id,msg.id).then(console.log).catch(e=>null);
  })

  return res.status(200).json({ status: "OK", payload: {PAYLOAD,itemMarketDetails} });

  //res.redirect('/shop/marketplace')
});




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

  if(!entry) return res.status(404).json({status: "ENTRY NOT FOUND"});
    
  if(entry.completed) return res.status(410).json({status: "LISTING HAS BEEN TERMINATED"});
  if(entry.lock) return res.status(409).json({status: "ENTRY IS LOCKED"});

  //if(entry.author === CURRENT_USER.id) return  res.status(403).json({status: "CANT BUY FROM SELF"});
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
      if(entry.feedMessage){
        await processFeedMessage(entry, item, CURRENT_USER);
      }
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
  //if(entry.author === CURRENT_USER.id) return  res.status(403).json({status: "CANT BUY FROM SELF"});
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

      if(entry.feedMessage){
        await processFeedMessage(entry, item, CURRENT_USER);
      }

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

  let originalEntry = await DB.marketplace.findOne({ id: entry }).lean();
  if(!originalEntry) res.status(404).json({status: "ENTRY NOT FOUND"});
  if(originalEntry.author !== req.user.id) return  res.status(403).json({status: "NOT ALLOWED"});

  DB.marketplace.updateOne({ id: entry } , {$set: {price} }).lean().then(async (r) => {
    if(r.nModified) {
      
      await updateFeedMessage(originalEntry,price);
      
      return res.status(200).json({updated: r.nModified, status: "OK"})
    }
    else res.status(410).json({status: "Nothing to update"});
  }).catch(err=>{
    console.error(err);
    res.status(500).json({status: "ERROR"});
  })
})


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
  
  if (res) return true;
  else return false;
}

async function processFeedMessage(entry, item, CURRENT_USER) {
  let entryOwner = await userCache.get(entry.author);
  PLX.editMessage(...entry.feedMessage, {
    content: `${_emoji('nope')} • This listing is gone!`,
    embed: {
      description: `${_emoji(item.rarity)} **${item.name}** has been ${entry.type == 'sell' ? "sold to" : "bought by"} [${CURRENT_USER.username}#${CURRENT_USER.discriminator}](${HOST}/profile/${CURRENT_USER.id}) for ${_emoji(entry.currency)}**${entry.price}**`
    }
  });
}
async function updateFeedMessage(oldEntry, newPrice) {
  //FIXME this looks like some eris shit
  console.log(1)
  if (!oldEntry.feedMessage) return;
  console.log(2)
  console.log(oldEntry.feedMessage)
  console.log(PLX.requestHandler.ratelimits['/channels/792176688070918194/messages/:id'])
  console.log( require('eris').VERSION )
  
  let message = (await axios.get("https://discord.com/api/v8/channels/"+oldEntry.feedMessage[0]+"/messages/"+oldEntry.feedMessage[1],{headers:{"Authorization": config.token}})).data
  //let message = await PLX.getMessage(...oldEntry.feedMessage).timeout(5000);
  console.log(3)
  let   embed   = message.embeds[0];
  embed.description = embed.description.replace(`**${oldEntry.price}**`,`**${newPrice}**`);
  embed.timestamp = new Date();
  console.log(4)
  await wait(4);
  //await PLX.editMessage(...oldEntry.feedMessage, { content: message.content, embed });
  (await axios.patch("https://discord.com/api/v8/channels/"+oldEntry.feedMessage[0]+"/messages/"+oldEntry.feedMessage[1],{ content: message.content, embed },{headers:{"Authorization": config.token} } )).data
  console.log(45)
  await wait(4);
  //let channelInfo = await PLX.getRESTChannel(oldEntry.feedMessage[0]);
  PLX.createMessage(marketHook.channel, {embed:{color: embed.color, description: `⬆️ **[\`${oldEntry.id}\`](https://discord.com/channels/${marketHook.guild}/${marketHook.channel}/${message.id})** has been **edited**. New price: ${_emoji(oldEntry.currency)}**${newPrice}** *(was ${oldEntry.price})*` }} )
}

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
        return reject({status:400, info: "Bad Request"});
      });
    });

    const result = cos.concat(itm)[0];
    if (!result) return reject({status:404, info: "item not found"});
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
      min: Math.min(...marketplacePriceMap),
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
  let prequery;


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
  if (!softCheck){
    if (!(await DB.users.get(id)))
      return { res: false, reason: "USER NOT FOUND", status: 401 };
    if (!(await ECO.checkFunds(id, currency === "SPH" ? 2 : 300, currency)))
      return { res: false, reason: "NO INITIAL FUNDS", status: 422 };
    if (userData.amtItem("sph-license") < 1 && currency === "SPH") {
      res = false;
      reason = "NO SAPPHIRE LICENSE";
      status = 401;
    }
  }

  const userData = await DB.users.findOne({id}).noCache();

  let { res, reason, status, prequery, query } = itemInInventory(item, userData);

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