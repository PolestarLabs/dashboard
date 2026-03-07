const ECO = require("../../../pipelines/economy.js");
const express = require("express");
const router = express.Router();

const {
    BackgroundPrices, 
    MedalPrices, 
    SAPPHIRE_MODIFIER, 
    JADE_MODIFIER, 
    TOKEN_MODIFIER 
} = require("@polestar/constants/shop");

const defaultPrices = {
    background: BackgroundPrices,
    bundle: BackgroundPrices * 10,
    medal: MedalPrices
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

    const [userData, cosmeticsData] = await Promise.all([
        DB.users.findOne({id: req.user.id}),
        DB.userInventory.get(req.user.id),
    ]);

    
    let item = await DB.cosmetics.findOne({ 
        type,
        $or: [{id: finder},{icon: finder},{code: finder}]        
    }).lean();
    
    if(!item) return res.status(404).json(ERRORS.item404);
    

    const price = (itemPrice(item,currency));
    
    if(!userData) return res.status(404).json(ERRORS.user404);
    
    if (type === 'bundle'){
        return buyBundle({req,res,userData,cosmeticsData,bundle:item,price,currency});
    }
    
    if(
        (type == 'medal' && cosmeticsData?.medalInventory?.includes(item.icon)) ||
        (type == 'background' && cosmeticsData?.bgInventory?.includes(item.code))
    )  return res.status(403).json(ERRORS.itemOwned);
     
    if ( !(await ECO.checkFunds(userData.id,price,currency)) )  
        return res.status(403).json(ERRORS.noFunds);

    let trans = await ECO.pay(userData.id,price,`${type}_shop_dash`,currency).catch(err=>{
        res.status(500).json(ERRORS.ecoFail);
    });
    let respons;
    switch(type){
        case "background":
            respons = await DB.userInventory.set(userData.id,{$addToSet: {bgInventory: item.code} });
            break;

        case "medal":
            respons = await DB.userInventory.set(userData.id,{$addToSet: {medalInventory: item.icon} });
            break;
        case "sticker":
            respons = await DB.userInventory.set(userData.id,{$addToSet: {stickerInventory: item.id} });
            break;

        default:
            return res.status(500).json(ERRORS.noType);
    }
    res.status(200).json({status:"OK", cost: price, trans,respons});

})

async function buyBundle({req,res,userData,cosmeticsData,bundle,price,currency}){

    let bundleStats = calculateBundlePrice({userData,cosmeticsData,bundle,price});

    if(bundleStats.complete) return res.status(403).json(ERRORS.bundleOwned);
 
    if ( !(await ECO.checkFunds(userData.id,bundleStats.finalPrice,currency)) )
      return res.status(403).json(ERRORS.noFunds);
    let trans = await ECO.pay(userData.id,bundleStats.finalPrice,`storefront_bundle`,currency).catch(err=>{
        res.status(500).json(ERRORS.ecoFail);
    });
    return DB.userInventory.updateOne({userId:userData.id}, bundleStats.query ).exec().then(ok=>{
        res.status(200).json({status:"OK", cost: bundleStats.finalPrice, trans, ok,x:bundleStats.query});   
    }).catch(err=>{
        res.status(500).json({code: -1, status:"ERR", err});   
    });  

};

router.get("/bundle/price/:finder", async (req,res)=>{

    let bundle =  await DB.cosmetics.findOne({type:'bundle', id: req.params.finder}).lean();
    if(!req.user) return res.status(206).json({price: bundle.price, owned: [], info:"User not authenticated. This data is not complete."});
    const [userData, cosmeticsData] = await Promise.all([
        DB.users.get(req.user.id),
        DB.userInventory.get(req.user.id),
    ]);

    let bundleStatsRBN = calculateBundlePrice({userData,cosmeticsData,bundle,price: ~~(itemPrice(bundle,"RBN")) });
    let bundleStatsSPH = calculateBundlePrice({userData,cosmeticsData,bundle,price: ~~(itemPrice(bundle,"SPH")) });
    
    const payload = {}
    payload.SPH = {price: bundleStatsSPH.finalPrice, original: bundleStatsSPH.originalPrice}
    payload.RBN = {price: bundleStatsRBN.finalPrice, original: bundleStatsRBN.originalPrice}
    delete bundleStatsRBN.query
    delete bundleStatsRBN.originalPrice
    delete bundleStatsRBN.finalPrice
    Object.assign(payload,bundleStatsRBN)
 
    
    return res.status(200).json(payload)
})

function calculateBundlePrice({userData,cosmeticsData,bundle,price}){

    let tally = 0;
    let owned = []
    let toBeAdded = []
    let query = {$addToSet:{
        "bgInventory" : {$each:[]},
        "medalInventory" : {$each:[]},
        "stickerInventory" : {$each:[]},
    }};

    price = price || bundle.price;

    bundle.items.forEach(itm=>{
        let ownsItem = false;
        switch(itm.type){
            case "background":
            case "bg":
                if(cosmeticsData?.bgInventory?.includes(itm.id)){
                    ownsItem = !0
                    tally+= 1;
                }else{
                    query.$addToSet["bgInventory"].$each.push(itm.id)
                }
                break;
            case "medal":
                if(cosmeticsData?.medalInventory?.includes(itm.id)){
                    ownsItem = !0
                    tally+= .6;
                }else{
                    query.$addToSet["medalInventory"].$each.push(itm.id)
                }
                break;
            case "sticker":
                if(cosmeticsData?.stickerInventory?.includes(itm.id)){
                    ownsItem = !0
                    tally+=1.3;
                }else{
                    query.$addToSet["stickerInventory"].$each.push(itm.id)
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
            return  Math.ceil(basePrice * SAPPHIRE_MODIFIER);
        case "JDE":
            return  Math.ceil(basePrice * JADE_MODIFIER);
        case "EVT":
            return  Math.ceil(item.price || (basePrice * TOKEN_MODIFIER));
        case "RBN":
        default:
            return basePrice;
    }
}

router.get("/bgrotation", cache(30), async (req,res)=>{
    delete require.cache[ require.resolve("./weekly_rotation.js")]
    const Rotation = require ("./weekly_rotation.js");
    return res.json( await Rotation(req.query) );
})

router.get("/userrotation", async (req,res)=>{
    delete require.cache[ require.resolve("./weekly_rotation.js")]
    const Rotation = require ("./weekly_rotation.js");
    return res.json( await Rotation(req.query, req.user?.id) );
})

module.exports = router;
