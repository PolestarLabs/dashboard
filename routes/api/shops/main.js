const ECO = require("../../../pipelines/economy.js");
const express = require("express");
const router = express.Router();
const { bgPrices, medalPrices,sapphireModifier, jadeModifier, tokenModifier } = require("../../../../bot/GlobalNumbers.js");
const defaultPrices = {
    background: bgPrices,
    bundle: bgPrices * 10,
    medal: medalPrices
}

router.get("/", cache(60), async (req,res)=>{

})

 

router.post("/:type/buy/:finder", async (req,res)=>{

    const {type,finder} = req.params;
    const {currency} = req.body;

    if (currency === 'JDE') return res.status(401).json({status:"Jades are no longer supported as currency"});

    const userData = await DB.users.findOne({id: req.user.id});

    let item = await DB.cosmetics.findOne({ 
        type,
        $or: [{id: finder},{icon: finder},{code: finder}]        
    }).lean();

    const price = ~~(itemPrice(item,currency));
    
    if(!item) return res.status(404).json({status: "ITEM NOT FOUND"});
    if(!userData) return res.status(404).json({status: "USER NOT FOUND"});
    
    if (type === 'bundle'){
        return buyBundle({req,res,userData,bundle:item,price,currency});
    }

    if(
        (type == 'medal' && userData.modules.medalInventory.includes(item.icon)) ||
        (type == 'background' && userData.modules.bgInventory.includes(item.code))
    )  return res.status(403).json({status: "ITEM ALREADY IN INVENTORY"});
     

    if ( !(await ECO.checkFunds(userData.id,price,currency)) )  return res.status(403).json({status:"Insufficient Funds"});
    let trans = await ECO.pay(userData.id,price,`Webshop - ${type}`,currency).catch(err=>{
        res.status(500).json({status: "ERROR:ECOFAIL"});
    });

    switch(type){
        case "background":
            await userData.update({},{$addToSet: {'modules.bgInventory': item.code} });            
            break;

        case "medal":
            await userData.update({},{$addToSet: {'modules.medalInventory': item.icon} });       
            break;

        default:
            return res.status(500).json({status: "ERROR:NOTYPE"});
    }
    res.status(200).json({status:"OK", cost: price, trans});

})

async function buyBundle({req,res,userData,bundle,price,currency}){

    let bundleStats = calculateBundlePrice({userData,bundle,price});

    if(bundleStats.complete) return res.status(403).json({status:"User already owns all bundle items"});
 
    if ( !(await ECO.checkFunds(userData.id,bundleStats.finalPrice,currency)) )  return res.status(403).json({status:"Insufficient Funds"});
    let trans = await ECO.pay(userData.id,bundleStats.finalPrice,`Webshop - bundle`,currency).catch(err=>{
        res.status(500).json({status: "ERROR:ECOFAIL"});
    });
    return DB.users.updateOne({id:userData.id}, bundleStats.query ).exec().then(ok=>{
        res.status(200).json({status:"OK", cost: bundleStats.finalPrice, trans, ok,x:bundleStats.query});   
    }).catch(err=>{
        res.status(500).json({status:"ERR", err});   
    });  

};

router.get("/bundle/price/:finder", async (req,res)=>{

    let bundle =  await DB.cosmetics.findOne({type:'bundle', id: req.params.finder}).lean();
    if(!req.user) return res.status(206).json({price: bundle.price, owned: [], info:"User not authenticated. This data is not complete."});
    const userData = await DB.users.get(req.user.id);

    let bundleStatsRBN = calculateBundlePrice({userData,bundle,price: ~~(itemPrice(bundle,"RBN")) });
    let bundleStatsSPH = calculateBundlePrice({userData,bundle,price: ~~(itemPrice(bundle,"SPH")) });
    
    const payload = {}
    payload.SPH = {price: bundleStatsSPH.finalPrice, original: bundleStatsSPH.originalPrice}
    payload.RBN = {price: bundleStatsRBN.finalPrice, original: bundleStatsRBN.originalPrice}
    delete bundleStatsRBN.query
    delete bundleStatsRBN.originalPrice
    delete bundleStatsRBN.finalPrice
    Object.assign(payload,bundleStatsRBN)
 
    
    return res.status(200).json(payload)
})

function calculateBundlePrice({userData,bundle,price}){

    let tally = 0;
    let owned = []
    let toBeAdded = []
    let query = {$addToSet:{
        "modules.bgInventory" : {$each:[]},
        "modules.medalInventory" : {$each:[]},
        "modules.stickerInventory" : {$each:[]},
    }};

    price = price || bundle.price;

    bundle.items.forEach(itm=>{
        let ownsItem = false;
        switch(itm.type){
            case "background":
            case "bg":
                if(userData.modules.bgInventory.includes(itm.id)){
                    ownsItem = !0
                    tally+= 1;
                }else{
                    query.$addToSet["modules.bgInventory"].$each.push(itm.id)
                }
                break;
            case "medal":
                if(userData.modules.medalInventory.includes(itm.id)){
                    ownsItem = !0
                    tally+= .6;
                }else{
                    query.$addToSet["modules.medalInventory"].$each.push(itm.id)
                }
                break;
            case "sticker":
                if(userData.modules.stickerInventory.includes(itm.id)){
                    ownsItem = !0
                    tally+=1.3;
                }else{
                    query.$addToSet["modules.stickerInventory"].$each.push(itm.id)
                }
                break;
        }
        ownsItem ? owned.push(itm) : toBeAdded.push(itm);
    })
 
    let adjustment = tally / bundle.items.length;
    let finalPrice = Math.max(0,~~(price - price * adjustment));

    const payload = {
        finalPrice,
        originalPrice: price,
        discount: Math.min(~~(adjustment*100),100),
        complete: !toBeAdded.length,
        owned,toBeAdded,query
        
    }

    return  payload 
};

function itemPrice (item,currency="RBN"){
    let basePrice = item.price || defaultPrices[item.type]?.[item.rarity]
    switch (currency){
        case "SPH":
            return basePrice * sapphireModifier;
        case "JDE":
            return basePrice * jadeModifier;
        case "EVT":
            return basePrice * tokenModifier;
        case "RBN":
        default:
            return basePrice;
    }
}

module.exports = router;
