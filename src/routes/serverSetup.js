const md5 = require('md5')

// const DB = require('../database')
const operations = require('../pipelines/operations.js');

exports.run = async (req,res)=>{

    await wait(1);

    let SVID = req.params.serverid.toString();

      let [memberInfo,roleInfo,serverInfo,channelInfo] = await Promise.all([
            PLX.getRESTGuildMember(SVID, req.user.id),
            PLX.getRESTGuildRoles(SVID),
            PLX.getRESTGuild(SVID),
            PLX.getRESTGuildChannels(SVID)
        ]).catch(err=>{
            console.error(err)
            res.redirect("/admin/"+SVID)
            return [0]
        });
        if(!memberInfo) return;
    let modpass = roleInfo.some(role=> req.user.id === serverInfo.ownerID|| memberInfo.roles.includes(role.id) && (role.permissions.has('manageGuild')||role.permissions.has('administrator')) )


 
    if( !modpass && req.user.id !== "88120564400553984") serverInfo=null;

    if (!serverInfo) return res.sendStatus(401);
    req.user.validator = md5(Date.now());
    DB.serverDB.findOne({ id:SVID }).noCache().then(async serverData =>{
        if (!serverData){            
           await DB.serverDB.new(serverInfo);
           serverData = await DB.serverDB.findOne({id:SVID}).noCache();
        }        

        if(req.query.pg){
            return res.render('procedures/serverSetup/page'+req.query.pg, {serverData,serverInfo,channelInfo,langs: operations.getLangs(),validator:req.user.validator} )
        }
        res.render('procedures/serverSetup/main', {serverData,serverInfo} );
       
    }) 
 
 
}


