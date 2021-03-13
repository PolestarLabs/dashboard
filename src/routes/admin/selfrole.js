
const express = require('express');
const router = express.Router();

router.delete("/:serverID/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){

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


router.patch("/:serverID/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;
    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));
    
    if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){
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
});


router.put("/:serverID/selfrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){
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