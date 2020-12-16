const express = require("express");
const router = express.Router();
const nacl = require("tweetnacl");
const cfg = require('../../../config.js');
const publicKey = cfg.pubKey; 


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
  console.log(req.body);

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



module.exports = router;
