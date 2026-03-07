/**
 * Legacy pipeline — NOT MOUNTED in _allroutes.js (dashboard uses routes/dashboard.js).
 * If this is ever mounted, it uses DB.users (new collection), not old userdb.
 */
var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    if (!req.user) return next(new Error('Not authenticated'));

    const USR = req.user;
    const UDB = await DB.users.get(USR.id);

    if (!UDB) {
        return res.status(404).send('User not found');
    }

    res.render(__dirname + '/dash.html', {
        pix: `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
        name: USR.username,
        uname: USR.username,
        rubys: UDB.currency?.RBN ?? 0,
        exp: UDB.progression?.exp ?? 0,
        level: UDB.progression?.level ?? 0,
        ptxt: UDB.profile?.persotext ?? '',
        background: UDB.profile?.bgID ? `http://files.pollux.fun/${UDB.profile.bgID}.png` : '',
    });
});

module.exports = router;
