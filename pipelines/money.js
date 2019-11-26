const request = require('request');
// const gear = require('../../core/gearbox.js');
const cfg = require('../../config.json');
var paypal = require('paypal-rest-sdk');

/*
paypal.configure({
  'mode': 'live',//'live', //sandbox or live
  'client_id':  cfg.paypalClientID,
  'client_secret': cfg.paypalSecret
});
*/

// Set the headers
const headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

// Configure the request
module.exports={
  
  
  paypalTransaction: async function paypalTransaction(req, res) {
    console.log(req.body)
    let item = req.body.item

    buyables.findOne({id: item}).then(konoItem => {

      let TOTAL,
          USR_CURR = req.body.currency||"USD",
          SUBTOT,
          ITEMS =[], 
          QTD=Number(req.body.amt) || 1;
      const RATE = 4
      let AMT = konoItem.price_USD.toFixed(2);
      if(USR_CURR=="BRL")AMT = (AMT * RATE).toFixed(2);

      TOTAL = parseFloat(Math.round((AMT*QTD) * 100) / 100).toFixed(2);
   
      const ITM = {
        "quantity": QTD,
        "name": konoItem.name + "("+QTD+")",
        "price": AMT,
        "currency": USR_CURR,
        "description": konoItem.description
      }
      
      //SUBTOT = parseFloat(Math.round((AMT-3) * 100) / 100).toFixed(2);
      //USR_CURR = "BRL"
      
      ITEMS = [ITM]

      console.log(ITM,TOTAL,AMT)

      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://pollux.fun/ppreturn",
          "cancel_url": "http://pollux.fun/ppcancel"
        },
        "transactions": [
          {"payment_options": {
        "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
      },
            "note_to_payee": "testing",
            "amount": {
              "total": TOTAL,
              "currency": USR_CURR
            },
            "item_list": {
              "items": ITEMS
            },
            "description": "Pollux Marketplace"
            }]
      }
      var profile_name = Math.random().toString(36).substring(7);
      let create_web_profile_json = {
        "name": profile_name + "Pollux Fantastic Whatever Shoppie",
        "presentation": {
          "brand_name": "Pollux - the Fancy Maid"
        },
        "input_fields": {
          allow_note: true,
          no_shipping: 1
        },
        "flow_config": {
          "landing_page_type": "billing"
        }
      }      
      console.log("Configure PP")
         paypal.configure({
            'mode': req.query.beta==1?'sandbox':'live',//'live', //sandbox or live
            'client_id':  req.query.beta==1? cfg.paypalClientID_sandbox:cfg.paypalClientID,
            'client_secret': req.query.beta==1? cfg.paypalSecret_sandbox:cfg.paypalSecret
          });

         
      
      paypal.webProfile.create(create_web_profile_json, function (error, web_profile) {
        if (error) {
          console.log("details");
          console.log(error.response.details);
          console.log(error.response);
          console.log(error);
        } else {         
          create_payment_json.experience_profile_id = web_profile.id;
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              console.log(error);
            } else {
                res.send(payment.id)
            }
          });
        }
      });
    });
  },
  
  
  pagSeguroSession: function pagSeguro(req,res){
  
    let options = {
          url: "https://ws.sandbox.pagseguro.uol.com.br/v2/sessions/",
        method: 'POST',
        headers: headers,
        form: {
                email: cfg.pagEmail,
                token: cfg.pagToken
            }
    }
    
    request(options, function (error, response, body) {
      console.log('ping')
      
        if (!error && response.statusCode == 200&& typeof body == 'string') {
            let id = body.replace(/<.*<id>|<\/.*>/g,'')
            res.send(id)
        }else{
            res.send({error}) 
        }
    });   
  }
}



