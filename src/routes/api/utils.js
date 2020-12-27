const { is } = require('bluebird');
const express = require('express');
const router = express.Router();

const DAILY_COOLDOWN = 22 * 60 * 60e3;
const EXPIRE_COOLDOWN = DAILY_COOLDOWN * 2.1;

function getDailyMeta(daily, req) {
    const now = Date.now();
    const availableIn = Math.max(0, DAILY_COOLDOWN + daily.last - now);
    const streakExpiresIn = Math.max(0, EXPIRE_COOLDOWN + daily.last - now);
    return {
        availableIn,
        available: availableIn === 0,
        highest: daily.highest,
        currentStreak: daily.streak - 1,
        streak: daily.streak,
        streakExpiresIn,
        streakExpired: streakExpiresIn === 0,
        insured: daily.insured, 
        id: req.user.id
    }; // Do it server side since client's clock could be out of sync
}

router.get('/webdaily', async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Log in' });

    const daily = await DB.users.getFull(req.user.id).then((u) => u.counters.daily);
    const dailyMeta = getDailyMeta(daily, req);
    dailyMeta.discordUser = req.user;
    res.json(dailyMeta);
})

router.post('/webdaily', async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Log in' });

    const daily = await DB.users.getFull(req.user.id).then((u) => u.counters.daily);
    const dailyMeta = getDailyMeta(daily);

    if (!dailyMeta.available) return res.status(400).json({ message: 'Streak not available', retryAfter: dailyMeta.availableIn });
    const shouldDeleteStreak = dailyMeta.streakExpired && !dailyMeta.insured;

    const is = (x) => !(dailyMeta.streak % x);

    const myDaily = {
        RBN: 0,
        JDE: 0,
        SPH: 0,
  
        PSM: 0,
        comToken: 0,
        cosmo_fragment: 0,
  
        boosterpack: 0,
        EXP: Math.max(~~(dailyMeta.streak / 2), 10),
  
        stickers: 0,
        evToken: 0,
  
        lootbox_C: 0,
        lootbox_U: 0,
        lootbox_R: 0,
        lootbox_SR: 0,
        lootbox_UR: 0,
    };

    const softStreak = dailyMeta.streak % 10 || 10;
    switch (softStreak) {
        case 1:
        case 2:
            myDaily.RBN += 150; break;
        case 3:
            myDaily.JDE += 1000; break;
        case 4:
        case 8:
            myDaily.cosmo_fragment += 25; break;
        case 5:
            myDaily.JDE += 1500; break;
        case 6:
            myDaily.lootbox_C += 1; break;
        case 7:
            myDaily.RBN += 350; break;
        case 9:
            myDaily.comToken += 5; break;
    }

    switch(true) {
        case is(10):
            myDaily.RBN += 500;
            myDaily.JDE += 2500;
            myDaily.cosmo_fragment += 35;
            myDaily.boosterpack += 1;
            myDaily.EXP += 10;
            if (!is(50) && !is(100) && !is(30)) myDaily.lootbox_U += 1; break;
        case is(30):
            myDaily.EXP += 10;
            myDaily.lootbox_R += 1; break;
        case is(50):
            myDaily.EXP += 10;
            myDaily.SPH += 1;
            if (!is(100)) myDaily.lootbox_SR += 1;
        case is(100):
            myDaily.EXP += 25;
            myDaily.SPH += 5;
            myDaily.lootbox_UR += 1;
    }
    
    /*

        > get userdata!
        > check last daily!
        > determine grace period!
        > define if keep OR delete streak!
        > checks for insurance!
        > clone to bkp then destroy streak OR reverse decision?
        > checks if donator/has bonuses
        > applies bonus
        > check if milestone
        > applies bonus
        >
        > increment streak
        > award rubines
        > award items (sapphs/jades/boxes/etc)
        > burn new daily epoch
        >
        > return payload with next daily and counter to expiration and whether insurance is in place

     */

    res.json(req.user);
})

router.post('/webcraft', async (req,res)=>{

    const userID = req.user.id;

    // params needed: item-to-be-crafted-ID

    /*

        > fetch item
        > check item materials
        > check materials in inventory [item.materials]
        > check user funds for crafting costs [item.gemgraft]
        > accept OR reject
        > commit crafting (add item to user / increment count on current inventory) >> must use <Mongoose>userData.addItem(itemID [,AMT=1] )
        > return OK payload


    */

})

router.post('/webloot', async (req,res)=>{

    const userID = req.user.id;

    // params needed: lootbox-universal-ID

    /*

        > check for ROLL-ID
            IF NO ROLL-ID
                > fetch lootbox and its contents
                > fetch if lootbox currently belongs to userID
                > generate ROLL-ID
                > display contents

            (rerolls) 
            IF ROLL-ID
                > ????
                * ISSUES: user can leave page mid-roll


    */

})


module.exports = router