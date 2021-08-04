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
    // @ts-ignore req.user is the wrong type
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
    try {
        if (!req.user) return res.status(401).json({ message: 'Log in' });
        
        const [guildMember, timedUsage, userData] = await Promise.all([ // @ts-ignore PLX global and req.user.id "not exist"
            PLX.getRESTGuildMember("277391723322408960", req.user.id).catch(() => void 0), // @ts-ignore req.user is the wrong type
            new TimedUsage('daily', { day: DAILY_COOLDOWN, expiration: EXPIRE_COOLDOWN, streak: true }).loadUser(req.user), // @ts-ignore
            DB.users.getFull(req.user.id)
        ]);
    
        if (!timedUsage.available) return res.status(400).json({ message: 'Daily not available', availableAt: timedUsage.availableAt }); // REVIEW End user shouldn't see this, possible blacklist point?
    
        // @ts-ignore req.user
        const daily = new Daily(timedUsage, req.user, guildMember, userData);
        await daily.init();
    
        return res.json({...daily.myDaily, streak: daily.userData.counters.daily.streak + 1}); // TODO[epic=Bsian] Check if there's more stuff that might be needed
    
        /*
        const daily = await DB.users.getFull(req.user.id).then((u) => u.counters.daily);
        const dailyMeta = getDailyMeta(daily);
    
        if (!dailyMeta.available) return res.status(400).json({ message: 'Streak not available', retryAfter: dailyMeta.availableIn });
    
        res.json(req.user);
        */
    } catch (error) {
        res.status(500).json({ message: error.message, stack: error.stack })
    }
});

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


router.get('/check_handle/:handle',  cache(600), async(req,res)=>{
    const {handle} = req.params;

    console.log("aa")

    if ( handle.length > 32 || handle.length < 3 ) return res.status(400).json({status:"length",error:true});
    if (["pollux","polaris"].includes(handle)) return res.status(403).json({status:"reserved",error:true});

    const user = await DB.users.get({personalhandle:handle});
    if (user) return res.status(409).json({status:"taken",error:true});
    
    const userByID = await DB.users.get({id:handle});
    if (userByID) return res.status(405).json({status:"invalid",error:true});
    
    
    return res.status(200).json({status:"available",error:false});

})

module.exports = router