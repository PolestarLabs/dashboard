const express = require("express");
const axios = require("axios");
const router = express.Router();
const nacl = require("tweetnacl");
const cfg = require('../../../config.js');
const publicKey = cfg.pubKey; 
const readdirAsync = Promise.promisify(require("fs").readdir);




router.get("/test", (rq,rs) => {
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
  RegisterAllCommands()

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

  if (req.body.type === 1) {
    return res.json({ type: 1 });
  } else {
    let command = require( `./${req.body.data.name}.js` );
    if(!command) return res.status(400).json("Nope");
    else res.json( await command.exec(req) );
  }
});

function RegisterAllCommands(){
  readdirAsync("./").then((comms) => {
    comms.forEach(async cmd => {
        const cmdName = cmd.split('.')[0];
        if (cmdName.startsWith('_')) return;
        let cmdFile = require("./"+cmdName+".js");
        if (cmdFile) RegisterCommand(cmdFile);
    })
  })
}

function RegisterCommand(cmd){
  return axios.post(`https://discord.com/api/v8/applications/${cfg.clientID_laris}/commands` ,
  {
    content:    cmd.content,
    description: cmd.description
  },
  {headers: { Authorization: PLX.token }})
} 


module.exports = router;
RegisterAllCommands();