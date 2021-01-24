const ECO = require("../../../pipelines/economy.js");
const express = require("express");
const router = express.Router();
const { bgPrices, medalPrices,sapphireModifier, jadeModifier, tokenModifier } = require( process.env.BOT_PATH + "/resources/lists/GlobalNumbers.js" );
const defaultPrices = {
    background: bgPrices,
    bundle: bgPrices * 10,
    medal: medalPrices
}


const ERRORS = {
    item404:      { code: 0xA1, status: "ITEM NOT FOUND" },
    user404:      { code: 0xA2, status: "USER NOT FOUND" },

    itemOwned:    { code: 0xB1, status: "ITEM ALREADY IN INVENTORY" },
    bundleOwned:  { code: 0xB2, status: "User already owns all bundle items" },

    noFunds:      { code: 0xC1, status: "Insufficient Funds" },
    
    ecoFail:      { code: 0xF1, status: "ERROR:ECOFAIL" },
    noType:       { code: 0xF2, status: "ERROR:NOTYPE" },
    noJades:      { code: 0xFF, status: "Jades are no longer supported as currency" },
};


router.get("/", cache(60), async (req,res)=>{

})

 

router.post("/:type/buy/:finder",checkAuth, async (req,res)=>{

    const {type,finder} = req.params;
    const {currency} = req.body;

    if (currency === 'JDE') return res.status(401).json(ERRORS.noJades);

    const userData = await DB.users.findOne({id: req.user.id});

    
    let item = await DB.cosmetics.findOne({ 
        type,
        $or: [{id: finder},{icon: finder},{code: finder}]        
    }).lean();
    
    if(!item) return res.status(404).json(ERRORS.item404);
    

    const price = ~~(itemPrice(item,currency));
    
    if(!userData) return res.status(404).json(ERRORS.user404);
    
    if (type === 'bundle'){
        return buyBundle({req,res,userData,bundle:item,price,currency});
    }

    if(
        (type == 'medal' && userData.modules.medalInventory.includes(item.icon)) ||
        (type == 'background' && userData.modules.bgInventory.includes(item.code))
    )  return res.status(403).json(ERRORS.itemOwned);
     

    if ( !(await ECO.checkFunds(userData.id,price,currency)) )  
        return res.status(403).json(ERRORS.noFunds);

    let trans = await ECO.pay(userData.id,price,`Webshop - ${type}`,currency).catch(err=>{
        res.status(500).json(ERRORS.ecoFail);
    });
    let respons;
    switch(type){
        case "background":
            respons = await DB.users.set(userData.id,{$addToSet: {'modules.bgInventory': item.code} });            
            break;

        case "medal":
            respons = await DB.users.set(userData.id,{$addToSet: {'modules.medalInventory': item.icon} });       
            break;

        default:
            return res.status(500).json(ERRORS.noType);
    }
    res.status(200).json({status:"OK", cost: price, trans,respons});

})

async function buyBundle({req,res,userData,bundle,price,currency}){

    let bundleStats = calculateBundlePrice({userData,bundle,price});

    if(bundleStats.complete) return res.status(403).json(ERRORS.bundleOwned);
 
    if ( !(await ECO.checkFunds(userData.id,bundleStats.finalPrice,currency)) )
      return res.status(403).json(ERRORS.noFunds);
    let trans = await ECO.pay(userData.id,bundleStats.finalPrice,`Webshop - bundle`,currency).catch(err=>{
        res.status(500).json(ERRORS.ecoFail);
    });
    return DB.users.updateOne({id:userData.id}, bundleStats.query ).exec().then(ok=>{
        res.status(200).json({status:"OK", cost: bundleStats.finalPrice, trans, ok,x:bundleStats.query});   
    }).catch(err=>{
        res.status(500).json({code: -1, status:"ERR", err});   
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
