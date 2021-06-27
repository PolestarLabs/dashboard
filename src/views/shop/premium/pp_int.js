const logged_in = !!userinfo;
const factor ={
  EUR: 0.937,
  BRL: 5.538,
  //GBP: 0.812,
  USD: 1
}
function updateCurrency(){

  let currency = $('#currency-select').find(':selected')[0].id;
  $('.price .face').each(function(){
    let itm = $(this);
    itm.html( Math.floor(Number(itm.data('original'))*factor[currency]) )
  })
  $('.price .cents').each(function(){
    let itm = $(this);
    itm.html("."+ (~~(Number(itm.data('original'))*factor[currency]*100) % 100).toString().padStart(2,0) )
  })
}
updateCurrency()
$('#currency-select').change( function(){
  updateCurrency()
})

const namechanger = {
        title: 'Enter the name of your custom handle!',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Check',
        showLoaderOnConfirm: true,
        preConfirm: (desiredHandle) => {
        return new Promise((resolve) => {
          fetch('/profile/'+desiredHandle).then( data =>{
            if(data.status == 404){
              return resolve(desiredHandle)
            }else if(data.status == 200){            
              resolve(Swal.showValidationMessage("This handle is already taken!"))
            }else{         
              resolve(Swal.showValidationMessage("Validation Error!"))
            }
          })
        })
      },
        allowOutsideClick: () => !swal.isLoading()         
} 
 
  $(".plx-buy-button").click(function() {
    
    const cart = {
        item:this.id,
        currency:$('#currency-select').find(':selected')[0].id,
        amt: (this.id == "sapphire"? $("#saphs").val():this.id == "jade"? $("#jads").val(): 1),
        name: $(this).data('item'),
        description: $(this).data('dsc'),
        img: $(this).data('img'),
        price: $(this).data('price')
      }
        
    if(cart.item == 'handle'){
      console.log(cart)   
      Swal.fire(namechanger).then(result=>{
        console.log(result)
        if(result.value){       
          PLX.toggle("#modal-buy").toggle(); 
          cart.custom = result.value;
          return paypalize(cart)
        }else{
          PLX.toggle("#modal-buy").toggle();
          return paypalize(cart)
        }
      }) 
    }else{
      paypalize(cart)
    } 
})



  function paypalize(cart)  {
 
    var generated_html = logged_in ? `
      <div id='paypality'>
        <div class='item_details'>
          <img class="item_pic" src="/${cart.img}.png">
          <div>
            <span class="item_name">  ${cart.name} </span><br>
            <span class="item_price">  ${cart.currency=="BRL"?"R":""}${cart.currency=="EUR"?"€":"$"}   ${(( Number(cart.price)*factor[cart.currency] )*cart.amt).toFixed(2)}</span>
          </div>
        </div>
        <div class='aux'>
          <p class="litebox_discl"> This item will be automatically sent to your inventory on purchase. </p>
          <div class='insertion'> </div>
        </div>
      </div>
    ` : "<div> Log in First</div>";

$('#modal-buy .content').html(generated_html)

if(!logged_in) return login();  

    success_html="Your payment was processed and the items are available in your inventory now!<br>Thanks a lot for supporting!"
    fail_html="Oops... Something seem to have gone wrong."

    var successBox = {
      type:"success",
      title:"All set!",
      html: success_html,
      showCancelButton: false
    }
    var rejecBox = {
      html: fail_html,
      showCancelButton: true,
      cancelButtonText: "Nevermind...",
      confirmButtonText: "Try Again!",
      type: 'error'
    }
    var rejecBox_b ={
      type:"error",
      showCancelButton:false,
      confirmButtonText:"Okay, nevermind...",
      html: fail_html
    }

    paypal.Button.render({
    env: "production"//'production', // Or 'sandbox',
    //,commit: true // Show a 'Pay Now' button

        ,client: {
        //sandbox:    'AZjn2PyQsJ_wppkBVOiirPytTrwJ66rFUH0Vv96L_Qn_kr2cM7HpzSg4us03Ipl7JHnO56W20cyuV-Gw',
        production: 'AZb1lyrBGHUBQ-k-ucNnclxTOhxCQ7OWNMqhydTnhyApnPA2m9HyXOY9qKrPnFPo4w6rEHXCUHH8l2w9'
    },

  style: {
    color: 'blue',
    size: 'responsive'
  },

  payment: function(data, actions) {       
      return $.post("/paypal/place?paypal=payment",cart).then(function(res) {          
            return res;
        });         
  },      
  onAuthorize: function(data, actions) {
    console.log("AUTH")
    console.log(data)
    return actions.payment.get().then(function() {   
      return actions.payment.execute().then(function(data_3) {
        console.log(data_3)

        console.log("EXEC")
        
        if (data_3 == 'INSTRUMENT_DECLINED') {
          return Swal.fire(rejecBox).then((result) => {
            if (result.value) {
              actions.restart();
            } else {
              actions.close();
            }
          })
        }

        paypal.request.post("/paypal/authorized", 
        {paymentID: data.paymentID,payerID:   data.payerID})
        .then(()=> {
          PLX.toggle("#modal-buy").toggle();
          Swal.fire(successBox);
        })

        var trans = data_3.transactions[0]
        var XXX = {
          id: data_3.id,
          ts: data_3.create_time,
          name: data_3.payer.payer_info.first_name+" "+ data_3.payer.payer_info.last_name,
          email: data_3.payer.payer_info.email,
          transaction:{
            amount: trans.amount.total+" "+trans.amount.currency
            ,items: trans.item_list
          }
        }
        $.post("/money?paypal=webhook",{payload:XXX,meta:cart})
      }).catch(e=> {
        console.log(e)
        rejecBox.type="warning"
        //Swal.fire(rejecBox_b)
        console.log("ERROR WARNING CHT HOOK")
      })
    })
  },


    onCancel: function(data, actions) {
      rejecBox_b.html=data
      console.log("CANCEL")
      Swal.close()
    },

    onError: function(err) {
      //alert('werr')
      console.log("ERRRR")
      console.log(err)
      rejecBox_b.type="error"
      rejecBox_b.html=err
      Swal.fire(rejecBox_b)
    }
    }, "#paypality .insertion");    
  }