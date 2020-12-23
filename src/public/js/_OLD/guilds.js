    $('.advtog').click(function () {
      $('.advanced').attr('disabled', !this.checked)
      
      //$('.advanced').toggle()
      $('.unadvanced').attr('disabled', this.checked)
      //$('.unadvanced').toggle()
      
    }); 
$('.logstoggle').click(function () {
      $('.logset').toggle()      
    });


    $('.disableCheck').click(function () {
      var tg = $(this).data("target")
      console.log(tg)
      $(".thres" + tg).attr('disabled', !this.checked)
    })

      $(".itm").click(function () {
      $(".pgs").hide()
      $(".itm").removeClass("is-active")
      $(this).addClass("is-active")
      console.log($(this).data("target"))
      $("#" + $(this).data("target")).show()
    })

    
    $(".check").click(function(){
      var cls = $(this).data("type")
      console.log(cls,'v')
      console.log($(cls))
      $(cls).attr("disabled", !this.checked)      
    })


    $(document).ready(function () {
      $(".asbutton").first().click();
    })


    function getChecks() {

      var serverlogs = slogs

      if (typeof serverlogs != "object") serverlogs = def;

      $(".check").each(function () {
        var classi = $(this).data("type")
        var item = $(this).data("key")
        if (item==undefined) return;
        serverlogs[classi][item] = this.checked

      })
      return JSON.stringify(serverlogs) 
    }


    function reset(_default = false) {
      var slo = slogs
      var curr = getChecks()


      $(".check").each(function () {
        var classi = $(this).data("type");
        var item = $(this).data("key")
        if (item==undefined) return;
        if (_default && def[classi][item] != curr[classi][item]) $(this).click();
        if (_default == false && slo[classi][item] != curr[classi][item].toString()) $(this).click();

      })
    }





    function response(res) {

      swal({
        title: res.t || "OK",
        text: res.m,
        type: res.s,
        confirmButtonColor: res.c,
        confirmButtonText: res.b,
        //closeonconfirm: true,
        // showLoaderOnConfirm: true,
      })
    }