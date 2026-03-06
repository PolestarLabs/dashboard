var express = require('express');
var router = express.Router();
const sv= require("../../core/gearbox.js")

// const DB = require('../database')

router.get('/', async function(req, res, next) {
    console.log(req.user)


   //  if (!req.isAuthenticated()) return  res.send('not logged in :(');

    console.log(req)



    let USR = req.user
    let UDB =  sv.userDB.get(USR.id)

    if (UDB == undefined){
        return "SHIT"
    }


    res.render(__dirname+'/dash.html', {
      pix:`https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
      name: USR.username,
        uname: USR.username,
      rubys:UDB.currency.RBN,
      exp:UDB.progression.exp,
      level:UDB.progression.level,
      ptxt:UDB.profile.persotext,
      background:`http://files.pollux.fun/${UDB.profile.bgID}.png`,

    });
   // res.json(req.user);
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();


     res.send('not logged in :(');
}

module.exports = router;
