
// const DB = require('../database')
const fx = require('../pipelines/globalFunctions.js');

module.exports = {

    index: function (req, res) {
        if (req.query.ref) {
            let ref = req.query.ref;
            DB.serverDB.set(ref, {
                $inc: {
                    'partnerDetails.refs': 1
                }
            });
        }
        res.render("index",{index:true})
    },

    callback: function (req, res, next) {
        let backURL = req.header('Referer') || '/';
        let ServerAdd = req.query.guild_id
//É ESSE QUE VALE
        if (ServerAdd) {
           
            
            res.redirect("/setup/" + ServerAdd);
        }else{
            try {
                res.render("callback", {redire: backURL});
              } catch (e) {
                  console.log(e)      
              }
        }
    },

      
    cmlist:async function (req, res, next) {
        let cm=fx.cmsSetup(req)   
        res.render('commands/cmd_element', {cm});
      
    },
}