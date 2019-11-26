
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

