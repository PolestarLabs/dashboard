  var vbd={}
  vbd.buy = "Buy this Bundle for <b>%1</b> %2?"
  vbd.buy2= "If you already possess items from this bundle, it's value will be reduced by 20%"
  vbd.nofunds = "Insufficient funds! Try a different currency."
  vbd.dupe = "You already have all items from this Bundle"
  vbd.complete = "Purchase successful!"
  vbd.complete2 = "Done! Go to dashboard now?"
  vbd.fug = "Fuck..."
  vbd.ye = "Yep"
  vbd.gtpro = "Go to Profile"
  vbd.close = "Close"
  vbd.nope = "Nope"

$('.delbdl').click(function(){
  var clas = "#"+$(this).data('del')
  $(clas).css("display","none")
})
$(".buybundle").click(function () {
  
  
  var currency = $(this).attr('currency')
  var item = $(this).data('item');
  var dataCost = $(this).data('cost');

  var buyTx=vbd.buy.replace('%1',miliarize(dataCost,true)).replace('%2',capitalize(dataCost=="1"?currency:currency+"s"));

  console.log(buyTx)
  swal({
    title: buyTx,
    html: vbd.buy2,
    imageUrl: `/images/${currency}.png`,
    showCancelButton: true,
    confirmButtonColor: $(this).css('background-color'),
    confirmButtonText: "Yes! Now!!!",
    cancelButtonText: "Hmm, maybe not...",
    showLoaderOnConfirm: true,
    preConfirm: (hm) => {
      return new Promise((resolve) => {
        setTimeout(f => {
          /*console.log(hasfunds)
          if (!hasfunds) {
            swal.showValidationError(vbd.nofunds)
            $(".swal2-confirm").hide()
            $(".swal2-cancel").html(vbd.fug)
            $(".swal2-title").html("Buy this... oh shit")
          }*/
          resolve()
        }, 1000)
      })
    }
  }).then((result) => {
    if (result.value) {
      
        let postage = $.post('/buy/'+item,{
          currency:currency+"s",
          type: 'bundle',

        })
      
        postage.done(function(data){
          console.log(data)
          if(data=="UNAFFORD")unaffordSwal();
          if(data=="DUPLICATE") dupeSwal();
          if(data=="OK"){
            b_finalSwal()
          }          
          
        })
        postage.fail(function(data){
          login();
        })      

      
    } 
  })
  
  function gotopro() {
  //  window.location.href = '/profile/me'
    window.location.href = '/dashboard' 
  }  
  
  function b_finalSwal() {
    return swal({
      title: "All set!",
     
      showCancelButton: true,
      confirmButtonText: vbd.gtpro,
      cancelButtonText: vbd.close,
    }).then(r=>r.value?gotopro():false)
  }

  function dupeSwal() {
    return swal({
      title: vbd.dupe,
      type: 'warning',
      confirmButtonText: "Ah..."
    })
  }
  function unaffordSwal() {
    return swal({
      title: "Oops, you cannot afford this...",
      type: 'error',
      confirmButtonText: "Geez..."
    })
  }
  
  

  
});