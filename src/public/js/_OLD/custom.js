$("body").on("domChanged", function () {
setTimeout(function(){$(".nano").nanoScroller();},2000)
});

function randomize(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
  }
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 
function miliarize(numstring,strict){
  if (!numstring)return 0 ;
        if (typeof numstring == "number"){
            numstring = numstring.toString()
        }
        if(numstring.length < 4)return numstring;

        var stashe = numstring.replace(/\B(?=(\d{3})+(?!\d))/g, ".").toString();

        if(strict){


            //log(stashe)
            //log(typeof stashe)
            var stash = stashe.split(".")
        switch(stash.length){
            case 1:
                return stash;
            case 2:
                if(stash[1]!="000") break;
                return stash[0]+"K";
            case 3:
                if(stash[2]!="000") break;
                return stash[0]+"."+stash[1][0]+stash[1][1]+"Mi";
            case 4:
                if(stash[3]!="000") break;
                return stash[0]+"."+stash[1][0]+stash[1][1]+"Bi";
             }

            return stashe;
        }

        stash = stashe.split(".")
        switch(stash.length){
            case 1:
                return stash.join(" ");
            case 2:
                if(stash[0].length<=1) break;
                return stash[0]+"K";
            case 3:
                return stash[0]+"Mi";
            case 4:
                return stash[0]+"Bi";
             }
         return stashe;
    }


document.addEventListener('DOMContentLoaded', function () {

  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'), 0);

  if ($navbarBurgers.length > 0) {

    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', function () {

        var target = $el.dataset.target;
        console.log(target)
        var $target = document.getElementById(target);

        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
    tabs.forEach(function ($tab) {
      $tab.addEventListener('click', function () {
        var target = $tab.dataset.target;
        console.log(target)
        var $target = document.getElementById(target);
        $(tabs).removeClass('is-active');
        $tab.classList.toggle('is-active');
        $(".tabcontainer").removeClass('is-hidden');
        $(".tabcontainer").fadeOut()
        try {
          count()
        } catch (e) {}
        $($target).delay(700).fadeIn()
        $(".nano").nanoScroller();
      });
    });
  }
});


$(document).ready(function () {


  $(".super-filter-button").click(function () {
    var value = $(this).data('filter');

    $(".super-filter-button").removeClass("is-active");


    $(this).addClass("is-active");

    if (value == "all") {
      $(".super-filter-button").removeClass("is-active");
      $('.super-filter').removeClass('filter-hidden')
      $(this).addClass("is-active");
    } else {
      $(".super-filter").filter('.' + value).removeClass('filter-hidden')
      $(".super-filter").not('.' + value).addClass('filter-hidden')
    }

  });

  $(".filter-button").click(function () {
    var value = $(this).data('filter');

    $(".filter-button").removeClass("is-active");


    $(this).addClass("is-active");

    if (value == "all") {
      $(".filter-button").removeClass("is-active");
      $('.filter').removeClass('filter-hidden')
      $(this).addClass("is-active");
    } else {
      $(".filter").filter('.' + value).removeClass('filter-hidden')
      $(".filter").not('.' + value).addClass('filter-hidden')
    }

  });

/*

  $(".filter-button").click(function () {
    var value = $(this).data('filter');
    
    $(".filter-button").removeClass("is-active");
    
    /*
    if ($(this).hasClass("is-active")) {
      $(this).removeClass("is-active");
      $(".filter").not('.' + value).removeClass('filter-hidden')
      return
    }
///
    $(this).addClass("is-active");

    if (value == "all") {
      $(".filter-button").removeClass("is-active");
      $('.filter').show('1000');
      $(this).addClass("is-active");
    } else {
      $(".filter").not('.' + value).addClass('filter-hidden')
    }

  });
*/

  document.addEventListener('DOMContentLoaded', function () {

    // Get all "navbar-burger" elements
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any nav burgers
    if ($navbarBurgers.length > 0) {

      // Add a click event on each of them
      $navbarBurgers.forEach(function ($el) {
        $el.addEventListener('click', function () {

          // Get the target from the "data-target" attribute
          var target = $el.dataset.target;
          var $target = document.getElementById(target);

          // Toggle the class on both the "navbar-burger" and the "navbar-menu"
          $el.classList.toggle('is-active');
          $target.classList.toggle('is-active');

        });
      });
    }

  });


});




$(".loginButton").click(function () {
  login()
})

$(".asbutton").click(function () {
  $(".asbutton").removeClass("is-active")
  $(this).addClass("is-active")
  let i1 = this.dataset.server
  let i2 = this.dataset.channel

  refreshChanlist(i1, i2)

});

setTimeout(function(){
  $('.preloder').append('<a id="quitlod" class="skiploader">SKIP</a>') 
  $('#quitlod').click(function(){
  console.log('BOOP')
   $(".prelod").fadeIn("slow")
  $(".preloder").fadeOut("slow")
})
},5000)



$(window).on('load', function () {

  $('script').remove()
  $(".prelod").fadeIn("slow")
  $(".preloder").fadeOut("slow")
  
  
  try {

    $(".nano").nanoScroller();



    var btn = $('#btn');
    var clipboard = new Clipboard(btn);
  } catch (e) {

  }
})





function refreshChanlist(i4, i1) {

  $.post(`./${i4}/${i1}/`, function (data) {
    var d=data.split("<!--another page starts here-->")
    $('#results').html(d[0]);
    $('#contraresults').html(d[1]);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var switches = Array.prototype.slice.call(document.querySelectorAll('.dswitch'), 0);
    switches.forEach(function ($switch) {
      $switch.addEventListener('click', function () {
        var target = $switch.dataset.target;
        console.log(target)
        var $target = document.getElementById(target);
        $(switches).removeClass('is-active');
        $switch.classList.toggle('is-active');
        $(".switchPanel").removeClass('hidden');
        $(".switchPanel").fadeOut()
        try {
          count()
        } catch (e) {}
        $($target).removeClass('hidden');
        $($target).delay(200).fadeIn()
        $(".nano").nanoScroller();
      });
    });
  
});


