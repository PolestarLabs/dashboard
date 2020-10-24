const md5 = require('md5')
const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const fx = require('../pipelines/globalFunctions.js');
const operations = require('../pipelines/operations.js');

request = require('request')

router.get('/', function (req, res) {
  res.sendStatus(401)
})


router.get('/:serverID', async function (req,res) {

    const serverID = req.params.serverID
    SVID = serverID

    if(  (req.user.id !== "88120564400553984" && req.query.admpass ) && !(await isAdmin(req,SVID))) return res.status(401).json("NoADM");

    req.user.validator = md5(Date.now());

    
    let [memberInfo,roleInfo,serverInfo,channelInfo,reactRoles,feeds,localranks,temproles,paidroles] = await Promise.all([
        PLX.getRESTGuildMember(SVID, req.user.id).catch(e=> null),
        PLX.getRESTGuildRoles(SVID),
        PLX.getRESTGuild(SVID),
        PLX.getRESTGuildChannels(SVID),
        DB.reactRoles.find({server:SVID}).lean().exec(),
        DB.feed.find({server:SVID}).lean().exec(),
        DB.localranks.find({server:SVID}).lean().exec(),
        DB.temproles.find({server:SVID}).lean().exec(),
        DB.paidroles.find({server:SVID}).lean().exec(),

    ]);

    //fx.

    
   
    const serverData = await DB.servers.get(serverID);
    let payload = {
        reactRoles,
        serverData: toBase64(serverData),
        commands: fx.cmsSetup(req),
        langs: operations.getLangs(),
        memberInfo: toBase64(memberInfo),
        roleInfo: toBase64(roleInfo),
        serverInfo: toBase64(serverInfo),
        channelInfo: toBase64(channelInfo),
        feeds,
        localranks,
        temproles,
        paidroles,
        validator:req.user.validator
    };
    
   
    
   return res.render('admin/base', payload);

});




router.post('/save',ADMCHECKS, async function(req,res){
    let payload = req.body.data || req.body;
    
    const SVID = req.query.serverID || req.body.serverid;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let svData= (await  DB.servers.get(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

if(!payload.first && svData && payload && (!req.body.noDM || userData.DMnotifs === true)){

    let diff=""
    if( svData.modules.MODROLE !== payload.modrole) diff +=      `\nModeration Role   : ${payload.modrole }`;
    if( svData.modules.MUTEROLE !== payload.muterole) diff +=    `\nMute Role         : ${payload.muterole }`;
    if( svData.modules.DROPS !== payload.drops) diff +=          `\nBox Drops         : ${payload.drops ? "✅" : "❌️"  }`;
    if( svData.modules.LVUP !== payload.lvup_glb) diff +=        `\nLevel Up Messages : ${payload.lvup_glb ? "✅" : "❌️"  }`;
    if( svData.modules.LVUP_local !== payload.lvup_loc) diff +=  `\nLocal LevelUps    : ${payload.lvup_loc ? "✅" : "❌️"  }`;
    if( svData.modules.LVUP_mess !== payload.l_mess) diff +=     `\nLevelUp Message   : ${payload.l_mess }`;
    if( svData.modules.autoRoleStack !== payload.rolestack)diff+=`\nStack Level Roles : ${payload.rolestack ? "✅" : "❌️"  }`;
    if( svData.modules.PREFIX !== payload.prefix) diff +=        `\nBot Prefix        : ${payload.prefix }`;
    if( svData.modules.GREET.channel !== payload.w_chan) diff += `\nWelcome Channel   : ${payload.w_chan }`;
    if( svData.modules.FWELL.channel !== payload.b_chan) diff += `\nGoodbye Channel   : ${payload.w_chan }`;
    if( svData.modules.GREET.enabled !== payload.w_togg) diff += `\nWelcome Enabled   : ${payload.w_togg ? "✅" : "❌️"  }`;
    if( svData.modules.FWELL.enabled !== payload.b_togg) diff += `\nGoodbye Enabled   : ${payload.w_togg ? "✅" : "❌️"  }`;
    if( svData.modules.GREET.timer !== (payload.w_timeout || null)) diff +=`\nWelcome Timer     : ${payload.w_timeout || "//-NO TIMEOUT-"}`;
    if( svData.modules.FWELL.timer !== (payload.b_timeout || null)) diff +=`\nGoodbye Timer     : ${payload.w_timeout || "//-NO TIMEOUT-"}`;
    if( svData.modules.GREET.text !== payload.w_mess )   diff += `\nWelcome Text:     : ${payload.w_mess.slice(0,30) } `;
    if( svData.modules.FWELL.text !== payload.b_mess) diff +=    `\nGoodbye Text:     : ${payload.b_mess.slice(0,30) } `;
        PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s
Changes:
\`\`\`${diff.length > 1?"js":""}${diff}
\`\`\`
Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
`}
        }).catch(e=>null) )
}

    const setPayload = {
        'modules.MUTEROLE': payload.muterole,
        'modules.MODROLE': payload.modrole,
        'modules.DROPS': JSON.parse(payload.drops||false), 
        'modules.LVUP': JSON.parse(payload.lvup_glb||false),
        'modules.LVUP_local': JSON.parse(payload.lvup_loc||false),
        'modules.LVUP_text': payload.l_mess,
        'modules.autoRoleStack': JSON.parse(payload.rolestack||false),
        'modules.PREFIX': payload.prefix,
        'modules.GREET.channel': payload.w_chan,
        'modules.GREET.enabled': JSON.parse(payload.w_togg||false),
        'modules.GREET.text': payload.w_mess,
        'modules.GREET.timer': payload.w_timeout,
        'modules.FWELL.channel': payload.b_chan,
        'modules.FWELL.enabled': JSON.parse(payload.b_togg||false),
        'modules.FWELL.text': payload.b_mess,
        'modules.FWELL.timer': payload.b_timeout
       
    } 
    if(payload.language){
        setPayload['modules.LANGUAGE']= payload.language || 'en'
    }    
    updateGlobalInstances({id:SVID})
    DB.servers.set(SVID,{
        $set:  setPayload  
    }).then(done=>{
      //  res.sendStatus(200);
    })
    
})




router.delete("/reactionrole",ADMCHECKS, async (req,res) =>{

    let payload = req.body;
 
    if(req.user.validator != payload.validator) return res.status(401).json("Validator Mismatch "+`${payload.validator} / ${req.user.validator}`);

    let SVID = payload.serverid.toString();    
    if(!(await isAdmin(req,SVID))) return res.status(401).json("User is not Admin");

    
    if(!req.body.noDM || userData.DMnotifs !== false){
        let serverInfo= (await PLX.getRESTGuild(SVID));
        let userData = (await DB.users.get(serverInfo.ownerID));
        PLX.deleteMessage(payload.channel,payload.message)
        PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
          embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Deleted Reaction Role Message at <#${payload.channel}>**

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
        }).catch(e=>null) )
    }

    payload.server=SVID;
    delete payload.validator;
    delete payload.serverid;
    DB.reactRoles.remove(payload)
    .then(done=>{
        return res.sendStatus(200);
    })

})

router.delete("/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;

    DB.servers.updateOne({id:SVID},{
        $pull:{
          ['modules.AUTOROLES']: [payload.role, Number(payload.level)||0 ]
        }         
    }).then(async done=>{

        let serverInfo= (await PLX.getRESTGuild(SVID));
        let userData = (await DB.users.get(serverInfo.ownerID));

        if(!req.body.noDM || userData.DMnotifs !== false){
        PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
            embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s
    
            **Deleted Level Role ${payload.role}**
    
            Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
            `}
        }).catch(e=>null) )}

        await DB.servers.set(SVID,{$pull:{'modules.AUTOROLES':null}});
        return res.status(200).json("Level Role Created!");
    }).catch(err=>{
        return res.status(510).json(err);
    })
})

router.delete("/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM || userData.DMnotifs !== false){

    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Deleted Self Role ${payload.role}**

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}


    DB.servers.updateOne({id:SVID},{
        $pull:{
          ['modules.SELFROLES']: [payload.role, payload.short  ]
        }         
    }).then(async done=>{
        await DB.servers.set(SVID,{$pull:{'modules.SELFROLES':null}});
        return res.status(200).json("Self Role Deleted!");
    }).catch(err=>{
        return res.status(510).json(err);
    })
})


router.patch("/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM || userData.DMnotifs !== false){
    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Changed Self Role [${payload.index}]: ${payload.role} - Level ${payload.level} **

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}
    
    DB.servers.updateOne({id:SVID},{
        $set: {
            ['modules.AUTOROLES.'+payload.index]: [payload.role, Number(payload.level)||0 ]
        }         
    }).then(done=>{
        return res.status(200).json("Level Role Created!");
    }).catch(err=>{
        return res.status(510).json(err);
    })
})

router.patch("/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));
    
    if(!req.body.noDM || userData.DMnotifs !== false){
    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Changed Self Role [${payload.index}]: ${payload.role} - Shortcut ${payload.short} **

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}
    
    DB.servers.updateOne({id:SVID},{
        $set: {
            ['modules.SELFROLES.'+payload.index]: [payload.role, payload.short ]
        }         
    }).then(done=>{
        return res.status(200).json("SELF Role Created!");
    }).catch(err=>{
        return res.status(510).json(err);
    })
}) 


router.put("/language",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    DB.servers.findOneAndUpdate({id:SVID},{
        $set: {'modules.LANGUAGE': payload.data}         
    }).then(async doc=>{
        updateGlobalInstances({id:SVID})
        .then(async response=>{

            let serverInfo= (await PLX.getRESTGuild(SVID));
            let userData = (await DB.users.get(serverInfo.ownerID));

            if(!req.body.noDM || userData.DMnotifs !== false){

            PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
                embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s
        
                **Changed Global Language to __${payload.data}__**
        
                Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
                `}
            }).catch(e=>null) )}

            if(response && response.ok) return res.status(200).json("Language OK");
            else if (response) return  res.status(response.status).json(response.message);
            else  res.status(510).json("Unknown Error");

        }).catch(console.error  );
    }).catch(err=>{
        console.error(err)
        return res.status(510).json(err);
    })
})

router.put("/commandswitch",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    console.log('cmswitch')
    DB.servers.findOneAndUpdate({id:SVID},{
        $set: {'modules.DISABLED': payload.disabled, 'respondDisabled': payload.respond}         
    }).then(async doc=>{
        updateGlobalInstances({id:SVID})
        .then(response=>{
            if(response && response.ok) return res.status(200).json("Command Switch OK");           
            else  res.status(510).json("Unknown Error");

        }).catch(console.error  );
    }).catch(err=>{
        console.error(err)
        return res.status(510).json(err);
    })
})

router.put("/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM || userData.DMnotifs !== false){
    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Created Self Role ${payload.role}**

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}
    
    DB.servers.findOneAndUpdate({id:SVID},{
        $push: {
            'modules.SELFROLES': [[payload.role, payload.short ]]
        }         
    }).then(async doc=>{
        let roleInfo = await PLX.getRESTGuildRoles(SVID);
        return res.status(200).render("admin/templates/self_role_card",{
            i: doc.modules.SELFROLES.length,
            thisRole: roleInfo.find(r=>r.id==payload.role),
            sfrl: [payload.role, payload.short ],
            roleInfo
        });
    }).catch(err=>{
        console.error(err)
        return res.status(510).json(err);
    })
})

router.put("/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM || userData.DMnotifs !== false){
    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed settings for **${serverInfo.name}**'s

        **Created Level Role ${payload.role}**

        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}

    DB.servers.findOneAndUpdate({id:SVID},{
        $push: {
            'modules.AUTOROLES': [[payload.role, Number(payload.level)||0 ]]
        }         
    }).then(async doc=>{
        let roleInfo = await PLX.getRESTGuildRoles(SVID);
        return res.status(200).render("admin/templates/level_role_card",{
            i: doc.modules.AUTOROLES.length,
            thisRole: roleInfo.find(r=>r.id==payload.role),
            lvrl: [payload.role, Number(payload.level)||0 ],
            roleInfo
        });
    }).catch(err=>{
        console.error(err)
        return res.status(510).json(err);
    })
})

router.put("/savechannelist",ADMCHECKS,async (req,res)=>{
 
    let payload = req.body.data;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM || userData.DMnotifs !== false){
    PLX.getDMChannel(serverInfo.ownerID).then(chn=> chn.createMessage({
        embed: {color:0xff6699,description: `<@${req.user.id}> changed channel overrides for **${serverInfo.name}**'s
        Opt-out from DM notifications [HERE](${HOST+"/dashboard/dashboard#notifications"})
        `}
    }).catch(e=>null) )}

    let PAR;
    switch(payload.param){
        case "lootboxDrops":
            PAR = 'chLootboxOff'
            break;
        case "levelUps":
            PAR = 'chLvlUpOff'
            break;
        case "expBypass":
            PAR = 'chExpOff'
            break;
    }
     
 
    if(!PAR) return res.status(500).json("no PAR");

    await DB.servers.findOneAndUpdate({id:SVID},{
        $set: {
            [`switches.${PAR}`] :  payload.channels
        }         
    });  
    res.send('OK')
})

async function ADMCHECKS(req,res,nex){
    req.handled = true;
    if(req.user.id ==='88120564400553984')  nex(); 
    let payload = req.body;
    if(req.user.validator != payload.validator) return res.send({status:401,data:"Validator Mismatch "+`${payload.validator} / ${req.user.validator}`});
    let SVID = payload.serverid.toString();    
    if(!(await isAdmin(req,SVID))) return res.send({status:401,data:"User is not Admin"});
    else nex();
}


module.exports = router

global.GLOBALINSTANCES = [
    {
        ip:"136.243.78.7",
        prefix:90,
        clusters: 5,
        get ports(){
            return [...Array(this.clusters).keys()].map(clu=> this.prefix+clu.toString().padStart(2,"0"))
        }
    }
]

function updateGlobalInstances(payload){
    return new Promise(async resolve=>{
        payload.auth = "uschickens"
        Promise.all(
            GLOBALINSTANCES.map(instance=>{
                instance.ports.forEach(async port=>{
                    const response = await fetch(
                        `http://${instance.ip}:${port}/updateServerCache`,{
                            method:"POST",
                            headers: { "Content-Type": "application/json; charset=utf-8" },
                            body: JSON.stringify(payload)
                    }).catch(err=>null);
                    if(response && response.json){
                        let resp= await response.json();
                        if(resp != [null]) resolve({ok:true,resp});
                     }
                })
            })
        )
    })
}

