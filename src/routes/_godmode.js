const express = require('express');
const router = express.Router();
router.get('/', async (req,res)=>{
    
    if (!req.user) return res.redirect('/auth');
    const staffMember = await PLX.getRESTGuildMember("789382326680551455", req.user?.id);
    if (!staffMember) return res.status(403).json("Fuck Off");
    console.log(staffMember.roles)
    if (!staffMember.roles.includes("856742074723598346")) return res.status(403).json("No 🔑 role");
    
    res.render('_godmode/main',{})
})

router.post("/giveitem/:userID/:item",async(req,res)=>{
    const {item,userID} = req.params;
    const userdata = await DB.users.findOne({id:userID});
    if (!userdata) return res.status(404).json("Nouser");

    let l = await userdata.addItem(item);
    console.log({l},"godmode".bgRed);

    PLX.createMessage("792176688070918194",{
        embed: {
            description: `<@${req.user.id}> > \`giveitem\` **${item}** to <@${userID}>`
        }
    });
    res.json(l)
});

router.post("/givebg",async(req,res)=>{

});

router.post("/givesticker",async(req,res)=>{

});

router.post("/givemedal",async(req,res)=>{

});

router.post("/givegems",async(req,res)=>{

});


module.exports = router