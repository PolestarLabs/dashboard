const ECO = require("../../pipelines/economy.js");
const baselineBonus = {
    C:1,
    U:2,
    R:5,
    SR:10,
    UR:25,
    XR:50,
  }
  
const RAR_COLS = {
     C:  "gray"
    ,U:  "green"
    ,R:  "blue"
    ,SR: "magenta"
    ,UR: "orange"
    ,XR: "red"
}

const express = require('express');
const router = express.Router();


function isExact(pot,recipe){
    return itemsMatch(pot,recipe) &&
    recipe.every(item=>{
        let material = pot.find(m=> m.id === (item.id||item) );
        if (!material) return false;
        let needs = item.count || 1;
        let has = material.count;
        return has >= needs
    });
}

function itemsMatch(pot,recipe){
    return pot.length === recipe.length &&
    recipe.every(item=> 
        !!pot.find(m=> 
            m.id === (item.id || item)
        )
    );     
}



router.get('/:endpoint', cache(0.1),  (req,res) => {

    let queries = {}
    //queries.crafted = true;
    //queries.display = true;

    if(req.params.endpoint == 'search'){
        Object.keys(req.query)
            .filter(qry => ['_id','id','rarity','code','type'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
        
        let sort = {_id:-1}

        DB.items.find(queries,{emoji:0,usefile:0,altEmoji:0})
        .skip(parseInt(req.query.skip)||0)
        .limit( parseInt(req.query.lim)||50)
        .sort(sort).lean()
        .then(async result=>{
            if(result){
                let x = await Promise.all(result.map(res=> res.type == 'boosterpack' ? stickerCount(res) : null ));
            }
            result.forEach(x=>{               
                let timestamp = x._id.toString().substring(0,8)
                x.release = parseInt( timestamp, 16 ) * 1000 
                
            })
            res.json(result)
        })
    }else{
        DB.items.find({id:req.params.endpoint, crafted: !0, display: !0},
            {name:1, rarity:1, event:1, icon:1, id:1, type:1, gemcraft: 1, materials: 1, code: 1}).then(result=>{
            res.json(result)
        })
    }

})
 

async function stickerCount(pack){
    packdatafind = pack.materials.map(x=>x.id||x);
    console.log(packdatafind)
    let [pdata,mdata] = await Promise.all([
        DB.cosmetics.find({series_id:pack.icon},{name:1,id:1,rarity:1}).lean(),
        DB.items.find({id: {$in:pack.materials.map(x=>x.id||x) } },{name:1,id:1,rarity:1}).lean()
    ]);
    pack.size = pdata.length;
    pack.materialsData = mdata;
    pack.content = pdata;
    return pack;
}

const pItemcol = (y) => y.map(x=>x.name[RAR_COLS[x.rarity]]).join('\n');

router.post('/mix', async (req,res) => {

    const {pot} = req.body;
    const rars = ["C","U","R","SR","UR","XR"];
    const potTypeMap = pot.map(i=>i.type);
    
    let inventory,craftingHistory;
    if(req.user?.id){
        let [userData] = await Promise.all([
            DB.users.get( req.user.id, {'modules.inventory':1}),          
        ]);
    let   inventory = (userData?.modules?.inventory || []).filter(x=>x.count > 0);
    craftingHistory = (userData?.modules?.inventory || []).filter(x=>x.crafted > 0).map(i=>i.id);
       
    } 

    if (!pot) return res.status(400).json({error: "No Pot"});
    
    const query = {
        $or: [
            {materials: {$all:pot.map(i=>i.id)}},
            {'materials.id': {$all:pot.map(i=>i.id)}}
        ],
        crafted: !0, //display: !0
    };
    

    const queryExact = {
        $or: [
            {materials: {$size: pot.length, $all: pot.map(i=>i.id) }},
            {
                $and:pot.map(itm=>{
                    return {'materials.id': itm.id , 'materials.count': {$lte: itm.count} }
                }).concat({ materials: {$size: pot.length} })
            },
        ],    
        crafted: !0, //display: !0
    };
    let tCraftSize = ([...new Set( potTypeMap )]).length
    console.log({tCraftSize,pot})


    
    let possible =  await DB.items.find(queryExact).lean().exec();
    console.log("\n--------------------------Check 1",pItemcol(possible) )

    if (!possible.length) possible = await DB.items.find(query).lean().exec();
    else possible.exact = true;

    let insufficient = possible.filter(item=>{
        let materials = item.materials.map(x=>x.id);
        let ingreds   = pot.map(x=>x.id);
        if( ingreds.length === materials.length ) {
            possible.almost = true;
            possible.noMoreTable = true;
            return true;
        };
    });
    
    console.log("\n--------------------------Check 2", pItemcol(possible))
    if (!possible.length){
        
        const refinedPot = pot //.map(item=> { item.count *= ((rars.indexOf(item.rarity)+1)/2); return item})
        let querySameType = {
            $and: pot.map(itm=>{
                let craftType = itm.type;
                let threshold = refinedPot.filter(i=>i.type === craftType ).reduce((a,b)=> ({count: a.count + b.count}))?.count || 0;
                console.log(threshold)
                return {
                    
                    'typeCraft.count': { $lte: threshold },
                    'typeCraft.type': craftType,
    
                }
            })
            .concat({'typeCraft.type': {$all: potTypeMap ,}}),
            crafted: !0, //display: !0
        };
        console.log({refinedPot})
        possible = await DB.items.find(querySameType).lean().exec();
        const potSorted = pot.sort((a,b) => rars.indexOf(b.rarity) - rars.indexOf(a.rarity) );
        const highestRar = potSorted[0].rarity;
        const lowestRar = potSorted[pot.length -1].rarity;



        console.table( {'length':possible.length,lowestRar,highestRar })  
        possible = possible.filter(x=> {  
            let isBetterThanLowest =  (rars.indexOf(x.rarity) >= (rars.indexOf(lowestRar) || 1))
            let isSameOrInferiorThanBest = rars.indexOf(x.rarity) <= rars.indexOf(highestRar);
            console.table({
                thisRAR: x.rarity,lowestRar, highestRar,isBetterThanLowest,
                isSameOrInferiorThanBest

            })        
            return isBetterThanLowest && isSameOrInferiorThanBest
        });
        console.log('length',possible.length)  
        
        
        if (possible.length){            
            possible = [shuffle(possible)[0]]
            possible.typeCraft = true
        }else{
            querySameType = {'typeCraft.type' : {$all: potTypeMap } }
            if (pot.length === 3) querySameType.rarity = {$in: pot.map(i=>i.rarity)};
            console.log(querySameType)        
            possible = await DB.items.find(querySameType).lean().exec();
            possible.typeCraft = true
            possible.notQuite = true
        }
  
    }

    console.log("Exact:",possible.exact)
    console.log("typeCraft:",possible.exact)
    console.log("notQuite:",possible.notQuite)

        
    console.log( pItemcol(possible) )  

    
    if (possible.exact && possible.length > 1){
        
        let possiblest = possible.sort((a,b)=>{
            //if (craftingHistory.includes(a.id)) return -1;
            //if (inventory.map(x=>x.id).includes(a.id)) return -1;
            if ( a.materials.every(x=> x.count <= pot.find(y=> y.id == x.id)?.count ) ) return -1;
            if ( rars.indexOf(a.rarity) < rars.indexOf(b.rarity) ) return -1;
            if ( rars.indexOf(a.rarity) > rars.indexOf(b.rarity) ) return  1;
            if ( a.level < b.level  ) return  -1;
            if ( a.level > b.level  ) return   1;
        })
        possible = [possiblest[0]]
        possible.exact = true;
    }

    /*

    COSMO MAY BE CONFUSING WITH THIS

    if (insufficient){
        let discovery = possible[0];
        let canCraftNow = false;
        let isDiscovery = itemsMatch(pot, discovery.materials);

        return res.json({discovery, isDiscovery, canCraftNow});
    }
    */
   console.log({craftingHistory})
    if (possible.typeCraft && !possible.notQuite){

        let discovery   = possible[0];
        
        let canCraftNow = true //!possible.notQuite;
        
        let isDiscovery = !craftingHistory.includes(possible[0].id);

        return res.json({
            discovery,
            isDiscovery,
            canCraftNow,
            typeCraft: true,            
        });
        
    }
    

    if (possible.exact){

        let discovery = possible[0];
        let canCraftNow = isExact(pot,discovery.materials);
        let isDiscovery = !craftingHistory.includes(possible[0].id)

        return res.json({discovery, isDiscovery, canCraftNow});
        
    }else{
        return res.json({
            possible: possible.length ||0, 
            inventory,
            noMoreTable: possible.noMoreTable
            
        })
    };





   


    
    
    DB.items.find({$or: [{materials: {$all:items}}, {'materials.id': {$all:items}}], crafted: !0, display: !0},
        {name:1, rarity:1, event:1, icon:1, id:1, type:1, gemcraft: 1, materials: 1, code: 1}).then(result=>{
        
            result.map(itm=> {
                itm.materials.every(t=>items.includes(t))
            })
        res.json(result)
    })
     
})


router.post('/create', checkAuth, async (req,res)=> {
    const {pot,item} = req.body;
    const itemToCraft = await DB.items.get({id:item});

    if(!itemToCraft || !itemToCraft.crafted){
        return res.status(403).json({status:"ERROR",message:"This item can't be crafted"});
    }
    try{

        const userData = await DB.users.getFull(req.user.id);
        const pay = pot.map(itm=>{
            let itemToCheck = userData.modules.inventory.find(i=>i.id === itm.id);
            if (itemToCheck.count < itm.count) {
                //res.status(403).json({status:"ERROR",message:"You dont have enough of ["+itm.id+"]"});
                throw new Error("Invalid Inventory");
            };
        return [itm.id,itm.count];
    });
    const payGem = Object.keys(itemToCraft.gemcraft)?.map(it=>{
        let userBal = userData.modules[it];
        let itm = itemToCraft.gemcraft[it];

        if (userBal < itm) {
            //res.status(403).json({status:"ERROR",message:"You dont have enough "+itm+"."});
            throw new Error("Invalid Balance");
        };
        return [userData.id,itm, "Crafting ["+itemToCraft.id+"]" , it === 'rubines' ? "RBN" : it === 'sapphires' ? "SPH" : "JDE" ];
    });
    
    console.log(pay,payGem)
    await Promise.all( pay.map(material=> userData.removeItem(...material)) );
    await Promise.all( payGem.map(gems=> ECO.pay(...gems)) );
    
    await userData.addItem(item,1);
    await DB.users.set(msg.author.id, {$inc: {'progression.craftingExp':baselineBonus[itemToCraft.rarity] * amount} });
    await DB.users.set({id:req.user.id, "modules.inventory":item }, {$inc: {"modules.inventory.$.crafted": 1} });

    
    return res.status(200).json({status:"OK",message:"Item has been crafted",inventory: userData.modules.inventory});
}catch(err){
    res.status(400).json({status:"ERROR",message: err});
}


})

module.exports = router