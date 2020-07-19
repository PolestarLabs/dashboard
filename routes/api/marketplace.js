
const express = require('express');
const router = express.Router();

function getItemMarketDetails(item){
    return new Promise(async (resolve,reject)=>{

        const [cos,itm] = await Promise.all([
            DB.cosmetics.find({_id: item }).lean().exec(),
            DB.items.find({_id: item }).lean().exec()
        ]).catch(async ()=> { 
            return  await Promise.all([
                DB.cosmetics.find({$or:[{id: item},{icon: item},{code: item}] }).lean().exec(),
                DB.items.find({id: item }).lean().exec()
            ]).catch(e=> { 
                return reject(400,"Bad Request");
            })
        });
        const result = cos.concat(itm)[0];
        if(!result) return reject(404,"item not found");
        const marketplace = await DB.marketplace.find({item_id:result._id}).lean().exec();
        const marketplacePriceMap = marketplace.map(x=> (x.currency === 'SPH' ? 1000 : 1) * x.price );
        
        const response = {
            item: result,
            max: Math.max(...marketplacePriceMap),
            min: Math.max(...marketplacePriceMap),
            average: marketplacePriceMap.reduce((a,b)=> a + b,0) / marketplace.length,
            entries: marketplace
        }
        return resolve(response);
    })
}


router.get('/rates', async (req,res) => {
    const {bgPrices, medalPrices} = require('../../../bot/GlobalNumbers.js');
    return res.json({bgPrices, medalPrices});
});


router.get('/:item', async (req,res) => {
    const {item} = req.params;
       
    getItemMarketDetails(item).catch((code,reason)=>{
        res.status(code).json({reason})
    }).then(response=>{
        res.json(response)
    });
})

router.get('/', cache(60), async (req,res) => {
 
        let queries = {}
        Object.keys(req.query)
            .filter(qry => ['id','item_id','item_type','author','type','price'].includes(qry) )
            .forEach(ky=> {
                    queries[ky] = req.query[ky]
                })
 
 
        if (req.query.after){

            queries.timestamp = {$gte: Number(req.query.after) || Date.now() - 86400000 }
        }
        if (req.query.before){
            queries.timestamp = {$lte: Number(req.query.before) || Date.now()  }
        }

        let lim = Math.min( Number(req.query.limit) || 25, 100 );
        let skip = Number(req.query.skip) || 0;
        let sort = req.query.sort == 'oldest' ? 1 : -1

 
        DB.marketplace.find(queries, {__v:0}).sort({timestamp: sort}).limit(lim).skip(skip).then(async result=>{
     
            let [marketeers,cosmetics,goods]  = await Promise.all([
                DB.users.find({id:{$in:result.map(i=>i.author)}},{meta:1,id:1}).lean().exec().catch(e=>[]),
                DB.cosmetics.find({_id:{$in:result.map(i=>i.item_id)}}).lean().exec().catch(e=>[]),
                DB.items.find({_id:{$in:result.map(i=>i.item_id)}}).lean().exec().catch(e=>[])
            ]).catch(err=>{
                console.error(result.map(i=>i.item_id))
                
                res.status(500).send('ERROR')
            });
 console.log(result)
            let newThing=
                result.map(entry=>{
                    return Object.assign( 
                        { itemdata: cosmetics.concat(goods).find(i=>i._id==entry.item_id)},
                        { userdata: marketeers.find(u=>u.id===entry.author).meta},
                        entry._doc
                    );
                });

            res.json(newThing)
        }).catch(e=>{
            console.error(e)
            res.status(500).send("What the fuck are you trying?")
        })

})


module.exports = router