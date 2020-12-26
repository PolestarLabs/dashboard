const express = require('express');
const router = express.Router();

router.get('/webdaily', async (req, res) => {
    res.json(req.user);
})

router.post('/webdaily', async (req,res)=>{

    const userID = req.user.id;

    /*

        > get userdata
        > check last daily
        > determine grace period
        > define if keep OR delete streak
        > checks for insurance
        > clone to bkp then destroy streak OR reverse decision
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