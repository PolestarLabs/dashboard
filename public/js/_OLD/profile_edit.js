$(document).ready(function() {
  
  $('#publicshare button').click(function(){
     $('#publicshare').remove()
  })

$(document).on('click','.remstick ', function () {
  $("#area").html('')
  
})
$(document).on('click','.bgpick', function () {

  $("#area").html( $(this).attr('src').replace('.png','').split('/').slice(-1))
  $(".userbg").attr("src", $(this).attr('src'))

})


$('.editable').click(function () {
  
  if (this.id == "persotex") {
    swal({
      title: 'Set new personal text',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {
          console.log(textarea)
          if (textarea.length > 150) {
            swal.showValidationError('Max 150 characters!')
            resolve()
          } else {
            $.when($.post("/commitProfile", {
              operation: 'about',
              data: textarea
            })).then(val => {
              resolve()
            })
          }
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      if (result.value) {
        swal({
          type: 'success',
          title: 'Personal text saved!',
          html: 'New text: <strong>' + result.value + '</strong>'
        })
        $("#persotex").html(result.value)
      }
    })
  }
  
    if (this.id == "tagline") {
    swal({
      title: 'Set new tagline',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {
          console.log(textarea)
          if (textarea.length > 32) {
            swal.showValidationError('Max 32 characters!')
            resolve()
          } else {
            $.when($.post("/paramsave", {
              action: 'define',
              scope: 'user'
              ,param: 'tagline'
              ,target: 'self'
              ,value: JSON.stringify(textarea)
            })).then(val => {
              resolve()
            })
          }
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      if (result.value) {
        swal({
          type: 'success',
          title: 'Tagline saved!',
          html: 'New text: <strong>' + result.value + '</strong>'
        })
        $("#tagline").html(result.value)
      }
    })
  }
  
  
  if (this.id == "favcol") {
    swal({
      title: 'Set new Color',
      html:"<input class='colorpik' type='color'>",
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {
  
            $.when($.post("/paramsave", {
              action: 'define',
              scope: 'user'
              ,param: 'favcolor'
              ,target: 'self'
              ,value: JSON.stringify(swal.getContent().children[0].value)
            })).then(val => {
              resolve()
            })
          
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      console.log(result)
      if (result.value) {
        swal({
          type: 'success',
          title: 'Color saved!',
          background:swal.getContent().children[0].value,
          html: 'New text: <strong>' + swal.getContent().children[0].value + '</strong>'
        })
        setTimeout(f=>location.reload(),1000)
      }
    })
  }
  
    if (this.id == "medals") {
      location.replace('/dashboard/#/medals')
    }
  
  
    if (this.id == "background") {
  
     var bginvdiv=bginv.split(",")
     var txt=""
      for(i=0;i<bginvdiv.length;i++){
      txt+="<img class='bgpick' src='/backdrops/"+bginvdiv[i]+".png'>" 
    }
      var itm;
      
    swal({
      title: 'Set new Background',
      html:` 
<div class="level">
<span id='area' class="b500">${currbg}</span>
<a href="/bgshop" class="button is-purple">Get More</a>
</div>
<div class="nano inv_box" style="height:300px">
<div class="nano-content flexboxi" >
${txt
    }
</div>
</div>
`,
      width:"900px",
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {

            $.when($.post("/paramsave", {
              action: 'define',
              scope: 'user'
              ,param: 'bgID'
              ,target: 'self'
              ,value: JSON.stringify(swal.getContent().children[0].children[0].innerHTML)
            })).then(val => {
              itm = swal.getContent().children[0].children[0].innerHTML
              resolve()
            })
          
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      console.log(result)
      if (result.value) {
        
        swal({
          type: 'success',
          title: 'Background saved!',
        
          html: '<strong>' + itm + '</strong>'
        })
          $(".bf img").attr('src',"/backdrops/"+itm+".png")
  $(".bgprofile").attr('src',"/backdrops/"+itm+".png")
 
        
        //setTimeout(f=>location.reload(),1000)
      }
    })
  }
  

  
    if (this.id == "sticker") {

     var collection=stickers.split(",")
     var txt=""
      for(i=0;i<collection.length;i++){
      txt+=collection[i]?"<img class='bgpick stickpick' src='/build/stickers/"+collection[i]+".png'>":""
    }
      
      
      var itm;
    swal({
      title: 'Set Featured Sticker',
      html:`
<div class="level">
<span id='area' class="b500">${cstick}</span>
<a class="remstick button is-danger">Remove</a>
</div>
<div class="nano inv_box" style="height:250px">
<div class="nano-content flexboxi" >
${txt
    }
</div>
</div>
<a href="/bgshop" class="button is-purple">Get More</a>
`,
      width:"50%",
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {

            $.when($.post("/paramsave", {
              action: 'define',
              scope: 'user'
              ,param: 'sticker'
              ,target: 'self'
              ,value: JSON.stringify(swal.getContent().children[0].children[0].innerHTML)
            })).then(val => {
              itm = swal.getContent().children[0].children[0].innerHTML
              resolve()
            })
          
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      console.log(result)
      if (result.value) {
        swal({
          type: 'success',
          title: 'Sticker saved!',
        
          html: '<strong>' +itm+ '</strong>'
        })
          $("#sticker img").attr('src',"/build/stickers/"+(itm||"undefined")+".png")

        
        //setTimeout(f=>location.reload(),1000)
      }
    })
  }
  

    if (this.id == "flair") {

     var collection=flairs.split(",")
     var txt=""
      for(i=0;i<collection.length;i++){
      txt+=collection[i]?"<img class='bgpick flairpick' src='/build/flairs/top/"+collection[i]+".png'>":""
    }
      
      
      var itm;
    swal({
      title: 'Set Featured Flair',
      html:`
<div class="level">
<span id='area' class="b500">${flair}</span>
<a class="remstick button is-danger">Remove</a>
</div>
<div class="nano inv_box" style="height:250px">
<div class="nano-content flexboxi" >
${txt
    }
</div>
</div>
`,
//<a href="/bgshop" class="button is-purple">Get More</a>
      width:"50%",
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: "#2b2b2b",
      showLoaderOnConfirm: true,
      preConfirm: (textarea) => {
        return new Promise((resolve) => {

            $.when($.post("/paramsave", {
              action: 'define',
              scope: 'user'
              ,param: 'flairTop'
              ,target: 'self'
              ,value: JSON.stringify(swal.getContent().children[0].children[0].innerHTML)
            })).then(val => {
              itm = swal.getContent().children[0].children[0].innerHTML
              resolve()
            })
          
        })
      },
      allowOutsideClick: false
    }).then(function (result) {
      console.log(result)
      if (result.value) {
        swal({
          type: 'success',
          title: 'Flair saved!',
        
          html: '<strong>' +itm+ '</strong>'
        })
          $(".equipped").removeClass('equipped')
          $("#"+itm+"").addClass('equipped')

        
        //setTimeout(f=>location.reload(),1000)
      }
    })
  }
  

  
})


})