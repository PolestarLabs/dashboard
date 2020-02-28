// const DB = require('../database')

exports.run = async function (req, res, next, options={}) {

    //search/:endpoint/:page

   if (req.body.options) options = req.body.options;
   if (req.query.piece) req.body.piece = req.query.piece;


    let _endpoint = (options||{}).endpoint || req.params.endpoint;
    const _page = parseInt(req.params.page) || options.page ||req.query.page|| 0;
    const _rpp  = parseInt(req.query.rpp)   || options.rpp  ||req.query.rpp ||50;
    const _skip = _rpp*_page || 0;

    const prefilter =  (req.query.filter||options.filter)
    options.filter = prefilter;
    

    const _filter =  prefilter ? new RegExp("^(?=.*\\b"+ prefilter.split(" ").join('\\b)(?=.*\\b') + "\\b).+","gi") : false;
    const _rarity = req.query.R || options.rarity
    let _sorting = {_id:-1}
    let sort = req.query.sort || options.sort;

    if(sort == "newest") _sorting = {_id:-1};
    if(sort == "oldest") _sorting = {_id:1};
    if(sort == "rarest") _sorting = {price:1};


    let  endpointBase;
    let  queryString ={};
    let  userID = (req.user||{}).id;



    switch (_endpoint){
        case "backgrounds":
        case "bgs":
            endpointBase = "cosmetics"
            queryString  = {type:"background"}
            break;
        case "medals":
            endpointBase = "cosmetics"
            queryString  = {type:"medal"}
            break;
        case "userstickers":
            endpointBase = "userDB"
            queryString  = {id:userID||req.query.user}
            break;
        case "usersrank":
            endpointBase = "userDB"
            queryString  = {"modules.level":{$gte:5}}
            break;
        case "collection":
            _endpoint = options.collection || []
            break;
        case "base":
            endpointBase = options.base || null
            queryString  =  {}
            break;
    }

    let payload = {};
    let  results, itemCount ;

    if(typeof _endpoint == "object"){

        let isEvent = options.event=="true"||options.event==true
        let isExclusive =  req.query.exclusive || false;        

        itemCount = _endpoint.length;
        
        results = _endpoint.filter(item=>{

            if(_rarity && item.rarity !== _rarity) return false;
            if(_filter){
                if( !(item.name.match(_filter) || item.tags.match(_filter)) ) return false;
            }
            try{
                if(_filter && options.filterfield || req.query.filterfield){
                    let filterfield = options.filterfield || req.query.filterfield
                    if( !(item[filterfield].match(_filter))) return false;
                }
            }catch(err){}

            if(!isEvent && item.event) return false;
            if(!isExclusive && item.exclusive) return false;
            return true

        }).slice(_skip,_rpp+_skip)



    }else if(_endpoint =="marketplace"){
        let _searchtype = options.fstype
        _sorting = {timestamp:-1}
        results = await DB.marketplace.aggregate(
            [
                
                {$project: {			
                    item_id: {$convert: {input: "$item_id",to:"objectId", onError:null} }
                    ,id:0,type:1,item_type:1,price:1,currency:1,author:1,id:1,timestamp:1
                }},
                {$lookup: {from:"userdb",localField:"author",foreignField:"id",as:"userdata"}},	
                {$lookup: {from:"cosmetics",localField:"item_id",foreignField:"_id",as:"cosdata"}},
                {$lookup: {from:"items",localField:"item_id",foreignField:"_id",as:"junkdata"}},      
                
                
                (options.filter?{$match: { $or:[
                    {'cosdata.name': { $regex: _filter  } },
                    {'cosdata.tags': { $regex: _filter  } },
                    {'cosdata.rarity': { $regex: _filter  } },
                    {'cosdata.event': { $regex: _filter  } },
                    {'item_type': { $regex: _filter  } },
                    {'cosdata.series': { $regex: _filter  } },
                    {'userdata.meta.username': { $regex: _filter  } },
                ]
                } }:{$match:{}}),

                
                {$sort: _sorting },        
                {$skip: _skip },        
                {$limit: _rpp },  
        
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
                
            ]           
        );
        itemCount   =    await DB.marketplace.countDocuments({});        
        if(options.filter ){
            console.log(_filter)
            //console.log(results)
            /*
            results=results.filter(r=>{
                try{
                    if( !(r.itemdata[0].name.match(_filter)) && !((r.itemdata[0].tags||"").match(_filter)) ) return false;
                    else return true;
                }catch(e){
                    return false;
                }                
            })             
               */
        }
        
    }else{
        
        if (options.includeUnbuy=="true") queryString.buyable = false;
        else queryString.buyable = true;
        if (options.event=="true") queryString.event = {$exists:true};
        else queryString.event = {$exists:false};
        if (req.query.exclusive) queryString.exclusive = req.query.exclusive;
        else queryString.public = true;
        if (_rarity) queryString.rarity = _rarity;
        if (_filter) queryString.$or    = [{name:{$regex: _filter}},{tags:{$regex: _filter}}];        
        if (options.base) queryString = options.mongoquery || {};
        
        const [a,b] = await Promise.all([
            DB[endpointBase].find(queryString).sort(_sorting).limit(_rpp).skip(_skip).lean().exec(),
            DB[endpointBase].countDocuments(queryString)
        ]);
        results = a
        itemCount = b
        
    }


   
      payload.res = results
      payload.count = itemCount
      payload.pages = Math.ceil(itemCount/_rpp)
      payload.current = 1 +  Number(_page)

    C= payload.current
    L= payload.pages
if(C>L)C=L;

    payload.elpis_nex = (C + 2) < L 
    payload.elpis_prv = (C - 2) > 1


    payload.L = L 
    payload.F = 1
    payload.P = C-1
    payload.N = C+1
    payload.url = req.originalUrl
    if(!req.query.rpp) payload.url += '?rpp='+_rpp;
    console.log(options)
    if ( payload.res.length == 0 && !options.filter ) return res.sendStatus(404);

    if(req.body.piece) res.render(req.body.piece,{pagination:payload})

        if(req.query.json) return res.json(payload);

        if(options) return payload;

    
    

    res.render('structures/pagination',{pagination:payload})
}
