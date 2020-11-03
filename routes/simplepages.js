
// const DB = require('../database')
const fx = require('../pipelines/globalFunctions.js');

module.exports = {



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