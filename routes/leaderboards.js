const DB = require("../database");
const express = require("express");
const router = express.Router();
const fx = require("../pipelines/globalFunctions.js");

router.get("/", async (req, res) => {
    let LEAD= await compileLeaderboard(req.query.sv);
    
    res.render("displays/leaderboards", { LEAD });
});



router.get("/raw/:type", async (req, res) => {
  res.json( await compileLeaderboard(req.params.type) );
});
router.get("/:type", async (req, res) => {
    let LEAD= await compileLeaderboard(req.params.type);
    if(LEAD.length == 0) res.sendStatus(404);
    res.render("displays/leaderboards", { LEAD });
});

router.get("/discorduser/:id", async (req, res) => {
  Promise.all([DB.users.get({ id: req.params.id })])
    .then(user => {
      res.json(userRankify(user[0], user[1], false));
    })
    .catch(console.error);
});
async function compileLeaderboard(TYPE){
    let LEAD;

    if (!TYPE ||TYPE === "global") {
      LEAD = await DB.users
        .find({blacklisted:{$ne:"BOT ACCOUNT"}},{meta:1,id:1,'modules.exp':1,'modules.level':1,'modules.bgID':1})
        .limit(100)
        .sort({ "modules.exp": -1 });
    } else {
      let LEADS = await DB.localranks
        .find({ server: TYPE })
        .limit(100)
        .sort({ exp: -1 });
      let USERS = await DB.users.find({ id: { $in: LEADS.map(x => x.user) } });
  
      LEAD = LEADS.map((U, i) => {
        const thisUser = USERS.find(u => u.id == U.user);
  
        if (!U || !thisUser) return;
        thisUser.modules.exp = U.exp;
        thisUser.modules.level = U.level;
        return thisUser;
      });
    }
  
    LEAD = LEAD.map(U => userRankify(U));
  
    return LEAD;
}
function userRankify(plxUser = {}, discordUser, member) {
  let userRank = {};

  
  discordUser= discordUser || userCache?.get(plxUser.id) 
  PLX.getRESTUser(plxUser.id ).then(u=> userCache.set(u.id,u));
 

  if (discordUser) {
    userRank.name = member
      ? discordUser.nick || discordUser.user.username
      : discordUser.username;
    userRank.avatar = member
      ? discordUser.user.avatarURL
      : discordUser.avatarURL;
    userRank.disc = member ? "" : discordUser.discriminator;
  } else {
    userRank.name = "----------";
    userRank.avatar =
      "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png";
    userRank.disc = "0000";
  }
  if (plxUser.modules) {
    userRank.level = plxUser.modules.level;
    userRank.exp = plxUser.modules.exp;
    userRank.bg = plxUser.modules.bgID;
  }

  if (plxUser.meta) {
    userRank.name = plxUser.meta.username;
    userRank.avatar = plxUser.meta.avatar;
    userRank.disc = plxUser.meta.discriminator;
  }

  userRank.id = plxUser.user || plxUser.id || (discordUser || {}).id;

  return userRank;
}

module.exports = router;
