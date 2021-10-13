const express = require('express');
const router = express.Router();

const ServicePings = new Map();


router.get('/theme/:id', async (req,res)=>{
    const {user} = req.query;
	 const {id:theme} = requ.params;

	 if (req.user && user === req.user.id){
		await DB.users.set(user,{ $set:{"switches.dashTheme":theme}, $inc:{ [`counters.dashThemeClicks.${theme}`]: 1} });
		res.sendStatus(204);
	 }else{
		return res.sendStatus(400);
	 }
})

module.exports = router