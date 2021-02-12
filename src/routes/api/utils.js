// @ts-check
const { is } = require('bluebird');
const express = require('express');
const router = express.Router();
const { Daily, TimedUsage } = require('@polestar/timed-usage');

const DAILY_COOLDOWN = 22 * 60 * 60e3;
const EXPIRE_COOLDOWN = DAILY_COOLDOWN * 2.5;

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
    // @ts-ignore
    const timedU = await new TimedUsage('daily', { day: DAILY_COOLDOWN, expiration: EXPIRE_COOLDOWN, streak: true }).loadUser(req.user);
    const { userDaily: { streak, insured, last, highest }, available, keepStreak, availableAt, streakExpiresAt,  } = timedU;
    const availableIn = Math.max(0, availableAt - Date.now());
    const streakExpiresIn = Math.max(0, streakExpiresAt - Date.now());

    // @ts-ignore
    return res.json({ availableIn, available, highest, currentStreak: streak - 1, streak, streakExpiresIn, streakExpired: !keepStreak, insured, id: req.user.id, discordUser: req.user });

    /*
    const daily = await DB.users.getFull(req.user.id).then((u) => u.counters.daily);
    const dailyMeta = getDailyMeta(daily, req);
    dailyMeta.discordUser = req.user;
    res.json(dailyMeta);
    */
})

router.post('/webdaily', async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Log in' });

    const daily = await DB.users.getFull(req.user.id).then((u) => u.counters.daily);
    const dailyMeta = getDailyMeta(daily);

    if (!dailyMeta.available) return res.status(400).json({ message: 'Streak not available', retryAfter: dailyMeta.availableIn });

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