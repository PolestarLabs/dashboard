    
    function saveRl(role,type){
      if(type=='self'){
        let ind = selfroles.indexOf(role) 
            selfroles_left[ind] = $('#sfinput').val()
            selfroles_payload[ind][1] = $('#sfinput').val()
        $('#editself').replaceWith("<span class='editsfrole' data-id='"+role+"'>"+$('#sfinput').val()+"</span>")
      }

      if(type=='auto'){
        let ind = autoroles.indexOf(role) 
            autoroles_left[ind] = $('#atinput').val()
            autoroles_payload[ind][1] = $('#atinput').val()
        $('#editauto').replaceWith("<span class='editatrole' data-id='"+role+"'>"+$('#atinput').val()+"</span>")
      }
    }    
    function resetedit(){
    $('#editself').replaceWith("<span class='editsfrole'>"+$('#sfinput').data('previous')+"</span>")
    $('#editauto').replaceWith("<span class='editatrole'>"+$('#atinput').data('previous')+"</span>")
    }    
    function roleRemove(role,type){
      if(type=='self'){
        let ind = selfroles.indexOf(role) 
        selfroles.splice(ind,1)
        selfroles_left.splice(ind,1)
        selfroles_payload.splice(ind,1)
        $("#self_role_"+role).remove()
      }else if(type=='auto'){
        let ind = autoroles.indexOf(role) 
        autoroles.splice(ind,1)
        autoroles_left.splice(ind,1)
        autoroles_payload.splice(ind,1)
        $("#auto_role_"+role).remove()
      }
    }    
    function newRoleSpawn(role,type){
      var color =role.color;
      var name  =role.name;
      var id    =role.id;
      var short =role.short;
      
      if(type=='auto'){
        if(autoroles_left.includes(short))return swal('Error!','This Level is already in use!','error');
        if(autoroles.includes(id))return swal('Error!','This Role is already there!','error');
        
        var precontent_auto = `<div id="auto_role_${id}" class="level rolisting"><div class="level-left"><span style="color:${color};">@${name}</span></div><div class="level-item"></div><div class="level-right"><span class="editatrole" data-id=${id}>${short}</span></div><div class="level-right"><p> </p></div><div class="level-right"><a data-id=${id} class="button  is-danger del-atrole"><span class="icon">
    <i class="fa fa-close fa-lg"></i>
  </span></a></div></div>`
        autoroles.push(id)
        autoroles_left.push(short)
        autoroles_payload.push([id,short])
        $('.dv#auto').append(precontent_auto)
      }
      
      else if(type=='self'){
        if(selfroles_left.includes(short))return swal('Error!','This Shorthand is already in use!','error');
        if(selfroles.includes(id))return swal('Error!','This Role is already there!','error');
        
        var precontent_self = `<div id="self_role_${id}" class="level rolisting"><div class="level-left"><span style="color:${color};">@${name}</span></div><div class="level-item"></div><div class="level-right"><span class="editsfrole" data-id=${id}>${short}</span></div><div class="level-right"><p> </p></div><div class="level-right"><a data-id=${id} class="button  is-danger del-sfrole"><span class="icon">
    <i class="fa fa-close fa-lg"></i>
  </span></a></div></div>`
        selfroles.push(id)
        selfroles_left.push(short)
        selfroles_payload.push([id,short])
        $('.dv#self').append(precontent_self)
      }    
      }          
    function getPayload(){
      var payload = {}
      payload.mod   = $('#mod_role').find(":selected")[0].id
      payload.mute  = $('#mute_role').find(":selected")[0].id
      payload.self  = selfroles_payload
      payload.auto  = autoroles_payload
      payload.server= SERV
      
      return payload
    }
    
    function saveAll(payload) {
      $.when($.post("/process/save_roles_adm", {payload})).then(data => {
        if (data=='ALRITE')swal({type:'success',timer:2000});
        else if (data=='FORBIDDEN')swal('Error',"Don't XSS me yo piece of fuck!",'error');
        else swal('Error',"",'error');
      })
    }


      document.onkeydown = function(e){
          e = e || window.event;
          var key = e.which || e.keyCode;
          if(key===84){
             console.log(getPayload())
          }
      }
      
      
  
 $(document).ready(function(){
    $('.savroles_button').on('click', function(e) {
      saveAll(getPayload())
    })
    
    $('.padded').on('click', function(e) {
    var clickid = $(e.target)[0].id
    var prote = $(e.target).hasClass('protect')||$(e.target).hasClass('editsfrole')||$(e.target).hasClass('editatrole')
    var deleteire = $(e.target).hasClass('del-atrole')?'auto':$(e.target).hasClass('del-sfrole')?'self':false;

    if(clickid=='saverole') return saveRl($('#sfinput').data('id'),'self');
    if(clickid=='save_a_role') return saveRl($('#atinput').data('id'),'auto');
    if(clickid=='newsfrole') return newRoleForm('self');
    if(!prote) resetedit();
    if(deleteire!==false) roleRemove($(e.target).data('id'),deleteire);
    
    })
    $("#save_new_sfrole").click(function(e) {    
     var role={
      name: $('#new_self_role').find(":selected").text()
     ,color:$('#new_self_role').find(":selected").data('color')
     ,id:   $('#new_self_role').find(":selected")[0].id
     ,short:$('#shorthand').val()
     }
     newRoleSpawn(role,'self')
    })        
    $("#save_new_atrole").click(function(e) {    
     var role={
      name: $('#new_auto_role').find(":selected").text()
     ,color:$('#new_auto_role').find(":selected").data('color')
     ,id:   $('#new_auto_role').find(":selected")[0].id
     ,short:$('#trigger_aur').val()
     }
     newRoleSpawn(role,'auto')
    })    
    $('.padded').on('change', "#new_self_role", function(e) {
      $('#shorthand').val($(e.target).find(":selected").text().toLowerCase())
    })    
    $('.padded').on('click', ".editsfrole", function() {    
    resetedit()
    var id = $(this).data('id')
    var newContent =`
    <div id="editself" class="field has-addons is-small protect">
    <p class="control">
    <a class="button is-static protect">
            p!roleme
    </a></p>
    <div class="control protect">
    <input id="sfinput" data-previous="${$(this).html()}" class="input protect" type="text" data-id="${id}" value="${$(this).html()}">
    </div><div class="control protect"><a id="saverole" class="button is-info protect">
            Save
    </a></div></div>`
      // "<input class='input' value="+$(this).html()+">"
      $(this).replaceWith(newContent)
    })        
    $('.padded').on('click', ".editatrole", function() {    
    resetedit()
    var id = $(this).data('id')
    var newContent =`
    <div id="editauto" class="field has-addons is-small protect">
    <p class="control">
    <a class="button is-static protect">
            LEVEL
    </a></p>
    <div class="control protect">
    <input id="atinput" data-previous="${$(this).html()}" class="input protect" type="number" data-id="${id}" value="${$(this).html()}">
    </div><div class="control protect"><a id="save_a_role" class="button is-info protect">
            Save
    </a></div></div>`
      // "<input class='input' value="+$(this).html()+">"
      $(this).replaceWith(newContent)
    })
    })