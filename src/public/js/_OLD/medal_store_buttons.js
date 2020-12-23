
$(".howto").click(function(){
  swal({
    title:$(this).data("t"),
    html:$(this).data("modal").replace("%site%","<a href='http://patreon.com/pollux'> patreon.com/pollux</a>")
  })
})


  $(".purchase").click(function(){
    
    
    
        var price = $(this).data("price")
        var namely =  $(this).data("med")
    console.log(price)
    
      var check = $.post("/checklogin")
            
            var unlog=check.fail(function () {
            return true
          }) 
    
    if(unlog===true)return login();
    
      swal({
              title: "Buy this Medal?",
              text: `This Medal costs ${price} Rubines, confirm?`,
              type: "info",
             // imageUrl:,
              showCancelButton: true,
              confirmButtonColor: "#7fdd55",
              confirmButtonText: "Yes!",
              //closeOnConfirm: false,
              // showLoaderOnConfirm: true,
            }).then(function (rees) {
    if(!rees.value)return;

    console.log("confirm")

          var postage = $.post("/buy", {
            
            name:namely,
            required: Number(price),
            transaction: 'medal'

          })
           postage.done(function (res) {
        if (res.stats=="POSSESS"){

           swal({
              title: "Ooops!",
              text: `You already have this Medal!`,
              type: "error",
              confirmButtonColor: "#dd9e55",
              confirmButtonText: "Ah...",
              ////closeonconfirm: true,
              // showLoaderOnConfirm: true,
            },function () {
                  $("#buybut").removeClass("is-loading")
                })


      }else if (res.stats=="OK"){


        
                swal({
                  title: "Done!",
                  text: "Medal has been added to inventory!.",
                  showCancelButton: true,
                  confirmButtonColor: "#558fdd",
                  cancelButtonColor: "#558fdd",
                  confirmButtonText: "Go to profile editor",
                  cancelButtonText: "Go back to Shop",
                  type: "success",
                }).then(function () {
                  
                  location.href = "/dashboard#/profile";
                },function (dismiss) {
                if (dismiss === 'cancel') {
                  $("#buybut").removeClass("is-loading")
                 location.reload()

                }});
             

           }else{
                swal({
              title: "Insufficient funds!",
              text: `You need ${price} Rubys to buy this, you have: ${res.goods} `,
              type: "error",
              confirmButtonColor: "#5589dd",
              confirmButtonText: "Fuck",
              ////closeonconfirm: true,
              // showLoaderOnConfirm: true,
            },function () {
                  $("#buybut").removeClass("is-loading")
                })
           }
               })
              }, function (dismiss) {
                if (dismiss === 'cancel') {
                console.log("fail reload")
                  location.reload()
              }
              })


            });

      



















//BGSHOP IMPORT


var options = {
  useEasing: true,
  useGrouping: true,
  separator: '.',
  decimal: '.',
};

  var v={}
    v.buy = "Buy this Medal for <b>%1</b> %2?"
  v.nofunds = "Insufficient funds! Try a different currency."
  v.dupe = "You already have this Medal"
  v.complete = "Purchase successful!"
  v.complete2 = "Do you want to equip it now?"
  v.slot = "Choose a slot to equip it"
  v.fug = "Fuck..."
  v.ye = "Yep"
  v.gtpro = "Go to Profile"
  v.close = "Close"
  v.nope = "Nope"


function count() {

  $.each($('.countup'), function (X) {
    var count = $(this).data("count"),
      st = $(this).data("start") || 0,
      t = $(this).data("time") || 0,
      off = $(this).data("offset") || 0,
      numAnim = new CountUp(this, st, count, 0, t, options);
    setTimeout(function () {

      numAnim.start();
    }, X * 100 - off)
  });
}
$(document).ready(() => {
  count()
})

$(".openiv").click(function () {


  $(".rubinePrice").data('count', $(this).attr('pr'))
  $(".jadePrice").data('count', $(this).attr('pj'))
  $(".sapphirePrice").data('count', $(this).attr('ps'))
  $(".eventPrice").data('count', $(this).attr('pe'))

  
  
  $('.row').removeClass('is-hidden')

  if (!$(this).attr('pr')) {
    //$(".r.row").html('Cannot be purchased with Rubines')
     
    $('.r.row').addClass('is-hidden')
  }
  if (!$(this).attr('pj')) {
    //$(".j.row").html('Cannot be purchased with Jades')
    $('.j.row').addClass('is-hidden')
  }
  if (!$(this).attr('ps')) {
    //$(".s.row").html('Cannot be purchased with Sapphires')
    $('.s.row').addClass('is-hidden')
  }
  if (!$(this).attr('pe') || $(this).attr('pe')=="null") {
    //$(".s.row").html('Cannot be purchased with Sapphires')
    $('.e.row').addClass('is-hidden')
  }

  //$("#rubinePrice").html($(this).attr('pr'))
  //$("#jadePrice").html($(this).attr('pj'))
  //$("#sapphirePrice").html($(this).attr('ps'))

  
  $("#bgpic").attr('src', "/medals/" + ($(this).attr('code')) + ".png")
  $(".buythis").attr('item',$(this).attr('code'))
  //$(".code").html("Equip or buy this BG from Discord using this command:<br><b>p!bg <span id='vb'>"+$(this).attr('code')+"</span></b><br>")



  var thistags = $(this).attr('tags')? $(this).attr('tags').split(/ +/).map(tag => "<p class='tag is-info'>" + tag + "</p>") : false
  if(thistags){
    
  $("#bgbartags").html(thistags.join('\n'))

  $("#bgbartags").html(thistags.join('\n'))
  }else{
    $("#bgbartags").html("--No Tags Available--")
  }

  $('.sidepanel-bg').fadeIn()
  $('.sidepanel').css({
    "transform": "translateX(0)"
  });

  count()
})

//

  
$(".backbut").click(() => {
  closeSide()  
})



  function closeSide(){

    $('.sidepanel-bg').fadeOut()
    $('.sidepanel').css({
      "transform": "translateX(-130%)"
    });

  }
  

// operacci

$(".buythis").off('click');
$(".buythis").click(function () {
  
  
  var currency = $(this).attr('currency');
  currency = currency=='event'?"Event Tokens":currency;
  var currencyImg = "eventToken"//$(this).attr('currency') =='event'?"eventCurrency":currency.replace(/s$/,'')
  var fundsclass = '#'+$(this).attr('currency')[0].toLowerCase()+'funds'; 
  var datacount = $(fundsclass).data('count')
  var dataCost = $(this).data('count') 
  var hasfunds = Number(datacount)>=Number(dataCost)
  var bgcode_s = $("#vb").html()
          
  console.log(dataCost);
  
  var buyTx=v.buy.replace('%1',miliarize(dataCost,true)).replace('%2',capitalize(dataCost=="1"?currency.replace(/s$/,''):currency));
  
  swal({
    title: "Buy this Medal?",
    html: buyTx,
    imageUrl: `/images/${currencyImg}.png`,
    showCancelButton: true,
    confirmButtonColor: $(this).css('background-color'),
    confirmButtonText: "Yes! Now!!!",
    cancelButtonText: "Hmm, maybe not...",
    showLoaderOnConfirm: true,
    preConfirm: (hm) => {
      return new Promise((resolve) => {
        setTimeout(f => {
          console.log(hasfunds)
          if (!hasfunds) {
            swal.showValidationError(v.nofunds)
            $(".swal2-confirm").hide()
            $(".swal2-cancel").html(v.fug)
            $(".swal2-title").html("Buy this... oh shit")
          }
          resolve()
        }, 1000)
      })
    }
  }).then((result) => {
    if (result.value) {
      
        let postage = $.post('/buy/'+$(this).attr('item'),{
          currency:$(this).attr('currency'),
          type: 'medal'
        })
      
        postage.done(function(data){
          console.log(data)
          if(data=="UNAFFORD"){};
          if(data=="DUPLICATE") dupeSwal();
          if(data=="OK"){
                 finalSwal(bgcode_s)
          }          
          
        })
        postage.fail(function(data){
          login();
        })      

      
    } 
  })
  
  function gotopro() {
   // window.location.href = '/profile/me'
    window.location.href = '/dashboard'
  }
  
  
  function finalSwal(X) {
    return swal({
      title: "All set!",
      showCancelButton: true,
       imageUrl: `/medals/${X}.png`,
      confirmButtonText: v.gtpro,
      cancelButtonText: v.close,
    }).then(r=>r.value?gotopro():false)
  }

  function dupeSwal() {
    return swal({
      title: v.dupe,
      type: 'warning',
      confirmButtonText: "Ah..."
    })
  }
  
  
  
  function equip(X) {
    return new Promise(resolve => {
      setTimeout(f => {
        $.post('/equip/bg/'+X,resolve())
      }, 1000)
    })
  }
});


$('.sidepanel').swipeleft(function() { closeSide()})