const express = require('express')
const router = express.Router()
const beta = true; 

const request = require('request');
const cfg = require('../config.js');
const paypal = require('paypal-rest-sdk');

const headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

class PaypalTransaction {
    constructor(total,currency,items){
        Object.assign(this,{
            payment_options: {
                allowed_payment_method: "INSTANT_FUNDING_SOURCE",
                recurring_flag : false, 
            },
            note_to_payee: "testing",
            amount: { total,currency },
            item_list: { items },
            description: "Pollux Marketplace"
        })
    }
}
class PaymentPayload {
    constructor(T,C,I){
        Object.assign(this, {
            intent: "sale",
            payer: {
                payment_method: "paypal"
            },
            redirect_urls: {
                return_url: "http://pollux.fun/ppreturn",
                cancel_url: "http://pollux.fun/ppcancel"
            },
            transactions: []
        })
        this.transactions.push( new PaypalTransaction(T,C,I) )
    }
}
const RATES ={
    EUR: 0.937,
    BRL: 5.538,
    GBP: 0.812,
    USD: 1
}
const JSON_WEB_PROFILE = (profile_name =  Math.random().toString(36).substring(7) ) => ({
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
});

router.post('/place', async function (req, res) {
    paypalTransaction(req,res)
})

router.post('/authorized', async function (req, res) {

    paypal.configure({
        'mode': beta?'sandbox':'live',//'live', //sandbox or live
        'client_id':  beta? cfg.paypalClientID_sandbox:cfg.paypalClientID,
        'client_secret': beta? cfg.paypalSecret_sandbox:cfg.paypalSecret
    });
    console.log(req.body)
     
    paypal.payment.get(req.body.paymentID, async function (error, payment) {
        if (error||payment?.state !== 'approved') {
            console.error(error)
            console.error(payment)
            return res.status(403).send("ERROR")
        } else {
            console.log("APPROVED".green)

            await DB.audits.set({transactionId: payment.id},{$set:{'details.state':'approved'}});
            let transData = await DB.audits.findOne({transactionId: payment.id}).lean();

            let updateInv = await inventoryUpdate(req.user.id,transData);

            return res.json(updateInv)
        }
    
    });  
})
 

  async function paypalTransaction(req, res) {

    let item = req.body.item
    DB.buyables.findOne({id: item}).lean().then(konoItem => {

        const   Currency = req.body.currency||"USD";
        const   Custom   = req.body.custom;
        const   Quant    = Number(req.body.amt) || 1; 
     
        const   Price    = (konoItem.price*RATES[Currency]).toFixed(2);
        const   TOTAL    = (Price * Quant).toFixed(2);
        let     ITEMS    = []

        const ITM = {
          "quantity": Quant,
          "name": konoItem.name + "("+Quant+")",
          "price": Price,
          "currency": Currency,
          "description": konoItem.description
        }
      
        ITEMS = [ITM]

        console.log(ITM,TOTAL,Price)

        const PAYMENT_PAYLOAD = new PaymentPayload(TOTAL,Currency,ITEMS)
    
        console.log("Configure PP")
            console.log(req.query.beta == 1,'req query beta')
        paypal.configure({
            'mode': req.query.beta==1?'sandbox':'live',//'live', //sandbox or live
            'client_id':  req.query.beta==1? cfg.paypalClientID_sandbox:cfg.paypalClientID,
            'client_secret': req.query.beta==1? cfg.paypalSecret_sandbox:cfg.paypalSecret
        });

         
      
      paypal.webProfile.create(JSON_WEB_PROFILE(), function (error, web_profile) {
        if (error) {
          console.error("ERROR WEB PROFILE".red);
          console.error(error.response.details);
          console.error(error.response);
          console.error(error);
        } else {         
          PAYMENT_PAYLOAD.experience_profile_id = web_profile.id;
          paypal.payment.create(PAYMENT_PAYLOAD, async function (error, payment) {
            if (error) {
              console.log(error);
            } else {
                let payload = {} 
                payload.environment = req.query.beta?'BETA':'PROD'
                payload.from = req.user.id
                payload.to   = "PAYPAL"
                payload.type = `Premium Shop`
                payload.currency = Currency
                payload.transaction = ">>"
                payload.timestamp = Date.now();
                payload.transactionId = payment.id
                let AMT = payment.transactions[0].amount;
                payload.amt= AMT.total
                payload.details = payment
                payload.details.info = payment.transactions[0].item_list.items[0].name
                payload.details.item_id = konoItem.id
                payload.details.custom  = Custom
                 

                await DB.audits.new(payload);
                res.send(payment.id)
            }
          });
        }
      });

    });
  }
  

async function inventoryUpdate(user,transaction){

    console.log({transaction})

    const item = await DB.buyables.get(transaction.details.item_id);
    const meta = item.other;

    let operation;
    if(item.filter == 'gem'){
        operation = DB.users.set(user, {$inc: {[meta.field]:meta.amount } } );
    }
    if(item.filter == 'box' || item.filter == 'item'){
        let userData = await DB.users.findOne({id:user});
        operation = userData.addItem(item.id,meta.amount || 1);
    }
    if(item.filter == 'misc'){        
        operation = DB.users.set(user, {[meta.operation]: {[meta.field]: transaction.details.custom || 'INVALID' } } );
    }

    return (await operation);    

}


module.exports = router