const express = require('express');
const router = express.Router();


router.delete("/:serverID/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;

    DB.servers.updateOne({id:SVID},{
        $pull:{
          ['modules.AUTOROLES']: [payload.role, Number(payload.level)||0 ]
        }         
    }).then(async done=>{

        let serverInfo= (await PLX.getRESTGuild(SVID));
        let userData = (await DB.users.get(serverInfo.ownerID));

        if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){
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


router.patch("/:serverID/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;
    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){
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



router.put("/:serverID/levelrole",ADMCHECKS,async (req,res)=>{
    let payload = req.body;
    const SVID = req.params.serverID;

    let serverInfo= (await PLX.getRESTGuild(SVID));
    let userData = (await DB.users.get(serverInfo.ownerID));

    if(!req.body.noDM && userData?.switches?.notifications?.ownerNotif !== false){
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


module.exports = router;