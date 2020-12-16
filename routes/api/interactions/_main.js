const express = require("express");
const router = express.Router();
const nacl = require("tweetnacl");
const cfg = require('../../../config.js');
const publicKey = cfg.publicKey; 

/*
router.use(function(req, res, next) {
  var data = "";
  req.on("data", function(chunk) {
    data += chunk;
  });
  req.on("end", function() {
    req.rawBody = data;
    req.body = JSON.parse(data);
    next();
  });
});
*/
// I believe we do have raw body already
console.log('entrypoint')


router.get("/test", (rq,rs) => {
    console.log("test OK")
    return rs.json("OK");
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
    res.json({
      type: 4,
      data: {
        content: "is this person gay? yes."
      }
    });
  }
});



module.exports = router;
