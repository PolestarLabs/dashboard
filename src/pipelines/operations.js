

// const DB = require('../database')
const fs = require('fs')
const ECO = ('../database/Economy')

  const BGBASE= DB.cosmetics.bgs({});
  const MEDALBASE= DB.cosmetics.medals({});
  const STICKERBASE= DB.cosmetics.stickers({});
  const BUNDLEBASE= DB.cosmetics.find({type:'bundle'});

  function publishServerConfigUpdate(serverId) {
    if (!serverId) return;
    if (global.PLX?.redis?.publish) {
      PLX.redis.publish("pollux:server-config-updated", String(serverId));
    }
  }


  function getComms() {
    let path = __dirname + "/../../core"
    let files = fs.readdirSync(path + "/modules")
    let COMMANDS = {}
    COMMANDS.list = []
    COMMANDS.tree = {}
    for (i = 0; i < files.length; i++) {
      let filedir = path + "/modules/" + files[i]
      if (files[i] != "dev" &&
        files[i] != "experimental" &&
        files[i] != "donators" &&
        files[i] != "owner" &&
        //files[i] != "infra" &&
        files[i] != "eastereggs"
      ) {
        let morefiles = fs.readdirSync(filedir)
        for (y = 0; y < morefiles.length; y++) {
          if (!["imgreactor.js", "unstructured"].includes(morefiles[y])) {
            try {
              delete require.cache[require.resolve(`../../core/modules/${files[i]}/${morefiles[y]}`)]
              if (require(`../../core/modules/${files[i]}/${morefiles[y]}`).pub || morefiles[y] == 'australis.js') {
                COMMANDS.list.push(morefiles[y].replace(".js", ""))
                if (!COMMANDS.tree[files[i]]) COMMANDS.tree[files[i]] = [];
                COMMANDS.tree[files[i]].push(morefiles[y].replace(".js", ""))
              }
            } catch (e) {}
          }
        }
      }
    }
    return COMMANDS
  }

module.exports={
  
  notifyOwner: async function notifyOwner(sv,user,message){
    let load = `
User **${user.tag}** (${user.id}) edited Dashboard options for your server **${sv.name}**
\`\`\`js
${message}
---
//${new Date()}
\`\`\`
`
    await sv.owner.send(load);
    let LOG = (await DB.serverDB.findOne({id:sv.id})).modules.LOGCHANNEL||(await DB.serverDB.findOne({id:sv.id})).modules.MODLOG;
    if (LOG) await bot.channels.get(LOG).send(load);
  },
  
  buy: function buy(payload,body){
    
    return new Promise( async resolve=>{      
 
      //console.log(payload)

      let T = payload.type // BG, MEDAL
      let $ = payload.currency // ruby, jade
      
      let $index = $=='rubines'?'RBN':$=='jades'?'JDE':$=='sapphires'?'SPH':'event';
      
      let U = payload.user
      let [DATA, cosmeticsData] = await Promise.all([
          DB.users.findOne({id:U.id}),
          DB.userInventory.get(U.id),
      ]);
      
      let ITM = payload.item
      let base;
      
      let PRICEBG = {XR:80000,UR:32520,SR:15250,R:8200,U:3100,C:1850}
      let PRICEMD = {C:950,U:1590,R:2750,SR:6500,UR:15400};
      let rarmult =  {UR:280,SR:140,R:80,U:50,C:25}
      
      function convert(p1,curr){
         if(curr=="event")return p1 *2;
         return curr == 'jades'? Math.floor(p1 * 18.874) : curr == 'sapphires' ? Math.ceil(p1 / 3000 ) : curr='rubines' ? p1 : resolve("INVALID_CURRENCY");
      }
      
      
      switch(T){
        case 'bg':
          base = (await BGBASE).map(bg=>{
            (bg.price)
            bg.price=  ( bg.price||  $=="event"?rarmult[bg.rarity]*5:PRICEBG[bg.rarity]) 
            return bg
          });
          break;
        case 'medal':
          base = (await MEDALBASE).map(md=>{
            md.price =  $=="event"? null : ( md.price||PRICEMD[md.rarity]) 
            return md
          });
          break;
        case 'bundle':
          base = (await BUNDLEBASE).map(bd=>{
            return bd
          });
          break;
          
        default:
          return resolve("NOTYPE")
              }
      
      
      
      if(T==="bundle"){
        let bndl = base.find(bd=>bd.id==ITM);
        if(bndl){
          let price =convert(bndl.price,$) ;

          const toadd ={}
          toadd.mdl = bndl.items.filter(i=>i.type=="medal" ).map(x=>x.id);
          toadd.bgd = bndl.items.filter(i=>i.type=="bg"||i.type=="background" ).map(x=>x.id);
          toadd.stk = bndl.items.filter(i=>i.type=="sticker" ).map(x=>x.id);

          let hasAnyItem, hasAllItems;       

          if (
            toadd.mdl.some(item=> (cosmeticsData?.medalInventory||[]).includes(item)) ||
            toadd.bgd.some(item=> (cosmeticsData?.bgInventory||[]).includes(item)) ||
            toadd.stk.some(item=> (cosmeticsData?.stickerInventory||[]).includes(item))
          ) hasAnyItem = true;
          if (
            toadd.mdl.every(item=> (cosmeticsData?.medalInventory||[]).includes(item)) &&
            toadd.bgd.every(item=> (cosmeticsData?.bgInventory||[]).includes(item)) &&
            toadd.stk.every(item=> (cosmeticsData?.stickerInventory||[]).includes(item))
          ) hasAllItems = true;

            console.log(toadd.bgd )
            console.log(toadd.bgd.every(item=> (cosmeticsData?.bgInventory||[]).includes(item)) )
            
            if(hasAllItems === true) return resolve("DUPLICATE");
            if(hasAnyItem === true) price -= Math.round(price * .20);
          
          if(!DATA.currency[$] || DATA.currency[$] < price)return resolve("UNAFFORD");
          await ECO.pay(U.id,price,T+"shop_dash_bundle",$index||"RBN");
          //console.log(bndl)



          return DB.userInventory.set(U.id, {
            $addToSet:{
              'medalInventory'   : {$each:toadd.mdl},
              'bgInventory'      : {$each:toadd.bgd},
              'stickerInventory' : {$each:toadd.stk},
            }
          }).then(ok => resolve("OK"));
        }else{
          return resolve('no bundle');
        }
      }
      
      let itemObj = base.find(i=>i.icon==ITM||i.code==ITM)
      
      if(cosmeticsData?.[T+"Inventory"]?.includes(ITM)) return resolve("DUPLICATE");
      console.log({$index,$,itemObj})
      
      let price= $==='event'? itemObj.price? itemObj.price : T=='bg'? rarmult[itemObj.rarity]*5: rarmult[itemObj.rarity]*2 : convert(itemObj.price,$);

      
      if($!='event'){
        console.error({test:"0"})
        console.error({test:DATA.currency[$], minus:DATA.currency[$] < price,price})
        if(!DATA.currency[$] || DATA.currency[$] < price)return resolve("UNAFFORD");

        console.error({test:"1"})
          DB.users.findOne({id: U.id}).then(async USER => {
        console.error({test:"2"})

          console.log({line:"post non ev check y price check",$index,$,price})
          await ECO.pay(U.id,price,T+"shop_dash",$index||"RBN");

             DB.userInventory.set(USER.id, {$push: {[T+"Inventory"]: ITM}}).then(ok => resolve("OK"));
        })

      } else {

        if (!DATA.currency.EVT || DATA.currency.EVT < price) {console.log("UNAFFORD");return resolve("UNAFFORD");}

      if(itemObj.buyable !== true && typeof itemObj.exclusive !=='string'){
         return resolve("CANTBUY");
        //return DB.users.set(U.id,{'blacklisted':"XSS Attempt - Shop ["+ITM+"]"});
      }

        DB.users.findOne({id: U.id}).then(async USER => {

         await ECO.pay(U.id,price,T+"shop_dash","EVT");
            DB.userInventory.set(USER.id, {$push: {[T+"Inventory"]: ITM}}).then(ok => resolve("OK"))
        })
      }
      },
  
  equip: function equip(req,bot){
      return new Promise( async resolve=>{
      Promise.all([
          DB.users.findOne({id:req.user.id}),
          DB.userInventory.get(req.user.id)
      ]).then(async ([USER, cosmeticsData])=>{

          let type = req.params.type;
          let item = req.params.item;

          if(type=='bg'){
            if(cosmeticsData?.bgInventory?.includes(item)){
              DB.users.set(USER.id,{
                $set:{'profile.bgID':item}
              }).then(async ok=> {console.log("OK");resolve("OK")})
            }else{
              console.log("INVALID_ITEM");
              await DB.users.set(USER.id,{'blacklisted':"XSS Attempt - BGShop ["+item+"]"});
              resolve("XSS")
            }
          }else if (type=='medal'){
            let itemArray = req.body.itemArray;

              itemArray= itemArray.filter(async function(item, pos) {
                  if(!cosmeticsData?.medalInventory?.includes(item)){
                    await DB.users.set(USER.id,{'blacklisted':"XSS Attempt - MedalShop ["+item+"]"});
                    return resolve("XSS")
                  };
                        return a.indexOf(item) == pos;
                    });
            if (itemArray.constructor != Array) return resolve("NOT_ARRAY");
            if (itemArray.length != 9) return resolve("NOT_NINE");
        
               DB.users.set(USER.id,{
                $set:{'profile.medals':itemArray}
              }).then(ok=> {console.log("OK");resolve("OK")})
          }
      
      }).catch(e=>{console.log("NODATA");resolve("NO_DATABASE")})
      })
    },
  
  save_roles_adm: function save_roles_adm(req,res,bot){
    return new Promise( async resolve=>{

      let payload = req.body.payload;
      let G = payload.server
      let U = req.user
      //let GG = bot.guilds.get(G)
   let MOD = (await DB.serverDB.findOne({id:G})).meta.adms;
 if(MOD.includes(req.user.id)){

        
     
        
        await DB.serverDB.set(G,{$set:{'modules.AUTOROLES':payload.auto }});
        await DB.serverDB.set(G,{$set:{'modules.SELFROLES':payload.self }});
        await DB.serverDB.set(G,{$set:{'modules.MODROLE'  :payload.mod  }});
        await DB.serverDB.set(G,{$set:{'modules.MUTEROLE' :payload.mute }});
        publishServerConfigUpdate(G);
        
      resolve("ALRITE");
        
    }else{
      resolve("FORBIDDEN");
    }
  })
  },
  
  getchannel:async function getchannel(req,res,bot){

    try{
      
    let payload = req.body.payload;
    let sv = req.body.sv;
    let chandata = await DB.channelDB.findOne({id:payload});
      if (chandata == null) chandata = await DB.channelDB.new(bot.channels.get(payload));
      
    let inde = 0
    let svChannels = (await DB.serverDB.findOne({id:sv})).meta.channels;
      
    svChannels.sort((a,b)=>a.pos-b.pos);
    let langs = this.getLangs(); 
    let commands = this.cmsSetup(req);
    
    res.render('guild/commandchecks',{bot,IDDE:payload,chandata,svChannels,langs,commands});
    }catch(e){
      console.log(e)
    }
  },
  
  getLangs: function getLangs(){
    delete require.cache[require.resolve('../public/js/i18n.json')];
    const i18n = (require('../public/js/i18n.json'));
    let langs= i18n.map(x=>{return{iso:x.iso,english:x['name-e'].toUpperCase(),name:x.name.toUpperCase(),flag:x["site-flag"],flag2:x["sec-flag"] }})
    return langs;
  },

  cmsSetup: function cmsSetup(req) {
    let lang = req.query.lang || "dev";
    let json = JSON.parse(fs.readFileSync(__dirname + "/../../locales/" + lang + "/translation.json"))
    let aliases = JSON.parse(fs.readFileSync(__dirname + "/../../core/aliases.json"))
    let CMS = getComms();
    return {lang,json,aliases,CMS}
  },


  
  save_db_payload: function save_db_payload(req,res){
    return new Promise( async resolve=>{
      try{
        
      let mee = req.body.mee;
      let payload = req.body.payload;
      let G = req.body.server
      let U = req.user

     let MOD = (await DB.serverDB.findOne({id:G})).meta.adms;

      /*
      if(JSON.stringify(payload).includes("$")){
        this.notifyOwner(bot,GG,bot.users.get(U.id),"DATABASE ATTACK:\n"+require('util').inspect(payload))
        return("XSS");
      };
      */

      if(MOD.includes(req.user.id) || req.user.id=="88120564400553984"){
/*
 
        
        if (MOD && GG.member(U.id).roles.has(MOD) && GG.ownerID != U.iad){
            this.notifyOwner(bot,GG,bot.users.get(U.id),mee+" Updated:\n"+require('util').inspect(payload))
        }
  */      
        await DB.serverDB.set(G,{$set:payload});
        publishServerConfigUpdate(G);
    
        
      resolve("ALRITE");
        
    }else{
      resolve("FORBIDDEN");
    }
      }catch(e){
        console.log(e)
      }
  })
  },
    save_channel_payload: function save_channel_payload(req,res,bot){
    return new Promise( async resolve=>{
      try{
        
      let mee = req.body.mee;
      let payload = req.body.payload;
      let C = req.body.channel
      let S = req.body.server
      let U = req.user
     // let GG = bot.channels.get(C).guild
      let MOD = (await DB.serverDB.findOne({id:S})).meta.adms;
      
      if(JSON.stringify(payload).includes("$")){
        //this.notifyOwner(bot,GG,bot.users.get(U.id),"DATABASE ATTACK:\n"+require('util').inspect(payload))
        return("XSS");
      };
      

      if(MOD.includes(req.user.id)){
      /*
        
        if (MOD && GG.member(U.id).roles.has(MOD) && GG.ownerID != U.iad){
            this.notifyOwner(GG,bot.users.get(U.id),mee+" Updated:\n"+require('util').inspect(payload))
        }
        */
        
        await DB.channelDB.set(C,{$set:payload});

      resolve("ALRITE");
        
    }else{
      resolve("FORBIDDEN");
    }
      }catch(e){
        console.log(e)
      }
  })
  },
  
  
}