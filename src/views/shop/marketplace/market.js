
var payload = {}
async function reloadDates() {

    $('.date').each(function () {
        var ts = $(this).data('ts')
        x = moment(ts).format('MMM D YYYY')
        y = moment(ts).format('h:mm A')
        $(this.children[0]).html(x);
        $(this.children[1]).html(y);
    })
}

$(window).on("load", function () {
    let flashy = new URLSearchParams(window.location.search).get('ff')
    $("#" + flashy).addClass('ding')
})
$(document).ready(function () {
    let search = getUrlVars()['search'];
    if (search){
        let payload = {
            filter: search,
        }
        $("#search input").val(search)
        if(window.xhrUpdate) xhrUpdate.abort();
        window.marketfilter = payload.filter
        updateMarketCanvas(0, payload) 
    }

    $('#trade-dock').infiniteScroll({
        // options
        status: '.page-load-status',
        path: function() {
            var pageNumber = ( this.loadCount + 1 );                        
            return '/search/marketplace/'+ pageNumber+'?piece=shop%2Fmarketplace%2Flist&endpoint=marketplace&rpp=25&filter='+(window.marketfilter||"") ;
          },
        append: '.market-entry',
        history: false,
      })
    $('#trade-dock').on( 'append.infiniteScroll', function() {
        reloadDates()
})




    $(".trade-clickable").on("click", ".copyLink", function () {
        let el = $(this)
        let tgt = el.data('target')
        $('#copy-' + tgt).select();
        document.execCommand("copy");

    })
    $(".trade-clickable").on("click", "a.plx-pg-nav", function () {
        updateMarketCanvas($(this).data("link"), payload);
    });

    function updateMarketCanvas(query, options) {
        $("#search").addClass('is-loading')
        let dockHeight = $("#trade-dock").height();
        let tradeHeight = $("#sell-list").height();
        $("#sell-list").height(tradeHeight)
        $("#sell-list").html('<div class="plx-position-center" plx-spinner="ratio: 3"></div>')

        options.endpoint = "marketplace"
        window.xhrUpdate = $.post('/search/marketplace/' + query, {
            piece: 'shop/marketplace/list',
            options
        }, data => {

            $('#trade-dock').html(data)
            $("#trade-dock").height('auto')
            reloadDates().then(() => $("#search").removeClass('is-loading'))
        })
    }


    $("#search input").keyup(function(){ 
        payload = {
            filter: this.value,
            //event: this.event.checked,
            fstype: "bg",
            //rarity: this.rarity.selectedOptions[0].dataset.id,
            sort: "oldest"
        }
        if(window.xhrUpdate) xhrUpdate.abort();
        window.marketfilter = payload.filter
        updateMarketCanvas(0, payload) 
       
     

    })


    $('form').submit(function () {
        //$("#search").addClass('is-loading')
        query = $(".plx-pagination .plx-active a").data('link')
        payload = {
            filter: this.filter.value,
            //event: this.event.checked,
            fstype: "bg",
            //rarity: this.rarity.selectedOptions[0].dataset.id,
            sort: "oldest"
        }
        window.marketfilter = payload.filter
        updateMarketCanvas(0, payload) 
        return false;
    });




});
reloadDates() 

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}





function buyStoreItem(type,item,currency="RBN",marketOps = {}){
    
    Swal.fire({
      title: `Making an excellent acquisition...`,
      allowEscapeKey: () => !Swal.isLoading(),
      allowOutsideClick: () => !Swal.isLoading(),
      showConfirmButton: false,
      showLoaderOnConfirm: true,
      onOpen: Swal.clickConfirm,    
      preConfirm: () =>
        fetch(
          `/api/shop/${type}/${(marketOps.type=='buy'?'sell':'buy') || 'buy'}/${item}`,
          {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ currency })
          }
        ).then((r) =>
          r.json().then( val=> {
           console.log({val,rOk:r.ok,r})
            if(!r.ok){
              const newSwalOptions = {
                title : "Making an excellent acquisition... or not.",
                showCancelButton : true,
                showCloseButton : true,
              }
              
              if(val.code == 0xC1 || val.status == "OK"){
                currency = currency == 'RBN' ? 'SPH' : 'RBN';
                newSwalOptions.confirmButtonText = `Try with ${currency}`
                newSwalOptions.confirmButtonColor = currency == 'SPH' ? '#5599F0' : '#F03355';                    
              }
              if([0xB1,0xB2].includes(val.code)){
                newSwalOptions.showConfirmButton = false;
                if(val.code == 0xB1)
                  newSwalOptions.cancelButtonText = "Ah I can't have two?";
                if(val.code == 0xB2)
                  newSwalOptions.cancelButtonText = "Wow ok.";
              }
              if((val.code||00).toString(16).startsWith("f")){
                newSwalOptions.showConfirmButton = false;
                newSwalOptions.cancelButtonText = "😬"
              }
              
              Swal.update( newSwalOptions );
              return Swal.showValidationMessage(val.reason || val.status);
            }else{
                /*
              if(STORE && type!="marketplace"){
                STORE.userdata.modules[
                  (type=="background"?"bg"
                  :type=="flair"?"flairs"
                  :type)
                  + "Inventory"
                ].push(item)
              }else if(STORE && type === 'marketplace'){
                let itemToChange = STORE.market.find(e=>e.id == marketOps.id);
                if (itemToChange){
                  itemToChange.lock = true;                  
                }
              }*/

              return Swal.fire({
                title: "Yay!",
                text: `Your ${type} is in your inventory. What's next?`,
                type:'success',
                confirmButtonText: 'Go to profile',
                cancelButtonText: 'Continue browsing',               
                showCancelButton : true,
                showCloseButton : true,
                preConfirm: () => location.assign("/profile/me"),
                onClose: ()=> $('.modal-close').click()
                //cancelButtonColor: ,

              });
              
            }

          }).catch(err=> Swal.fire("Error!","Something went fucky wucky","error") && console.error(err) )
        )
    });
}
