const express = require("express");
const axios = require("axios");
const router = express.Router();
const nacl = require("tweetnacl");
const cfg = require('../../../../config.js');
const publicKey = cfg.pubKey; 
const readdirAsync = Promise.promisify(require("fs").readdir);




router.get("/test", (rq,rs) => {
  
  RegisterAllCommands();
    console.log("test OK")
    return rs.json("OK");
} )

router.post(["/test","/test2"],(rq,rs) => {

  console.log("test OK")
  console.log(rq.rawBody)
  console.log(rq.rawBody2)
  return rs.json({
    received: {
      body: rq.body,
      rawBody: rq.rawBody,
      rawBodyMystery: rq.rawBody2
    }
  });
} )



router.post("/", async (req, res) => {
  //RegisterAllCommands()

  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + req.rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );

  if (!isVerified) {
    return res.status(401).end("invalid request signature");
  }

  if(req.body.data.component_type == 2 ){
    console.log(req.body.data)
    if(req.body.data.custom_id == 'test'){
      PLX.createMessage("834570253253869599","Pls stop")
    }
    if(req.body.data.custom_id == 'test2'){
      PLX.createMessage("834570253253869599","uwu")
    }
    return
  }

  if (req.body.type === 1) {
    return res.json({ type: 1 });
  } else {

    console.log((require('util')).inspect(req.body.data,{colors:true,depth:8}))

    let command = require( `./${req.body.data.name}.js` );
    if(!command) return res.status(400).json("Nope");
    else res.json( await command.exec(req, req.body) );
  }
});

function RegisterAllCommands(){
  readdirAsync(__dirname).then((comms) => {
    comms.forEach(async cmd => {
      const cmdName = cmd.split('.')[0];
        console.log(" Registering Interaction ".bgBlue + " " + cmdName)
        if (cmdName.startsWith('_')) return;
        try{
          delete require.cache[require.resolve("./"+cmdName+".js")];
          let cmdFile = require("./"+cmdName+".js");
          if (cmdFile) RegisterCommand(cmdFile).catch(err=>{
            console.error( JSON.stringify(err.response.data,0,2) )
            console.error(` ${cmdName} `.bgRed)
          });
        }catch(err){
          console.error(" Interaction ERROR ".bgRed + " " + cmd);
          console.error(err)
          console.error("---------------------------------------".gray)
        }

    })
  })
}

function RegisterCommand(cmd){
  if ( !cmd.name && !cmd.description) return null;
  console.log(cmd.beta)
  return axios.post(`https://discord.com/api/v9/applications/${cfg.clientID + ( (cmd.beta ?? true) ? '/guilds/277391723322408960':'') }/commands` ,
  {
    name:    cmd.name,
    //type: cmd.type || 4,
    description: cmd.description,
    options: cmd.options,
    choices: cmd.choices,
  },
  {headers: { Authorization: PLX.token }})
} 


module.exports = router;

//RegisterAllCommands();