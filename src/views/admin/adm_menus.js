$(document).ready( ()=> {


var payload = {};
payload.language = langsel;
payload.prefix = $("#server-prefix").val() || "+";


$("#levelroleslist").on("submit",".levelrole_item", function(e) {
//$(".levelrole_item").submit(function(e) {
  e.preventDefault();

  let role = this["levrole-select-2"].value;
  let level = this.level.value;
  let face = this["levrole-select-2"][this["levrole-select-2"].selectedIndex]
    .innerHTML;

  let index = $(this).data("index");
  let payload = { role, level, validator, serverid, index };
  let original_F = $("#autorole-" + index + " .rolename.noinput").html();
  let original_L = $("#autorole-" + index + " .level.noinput").html();
  $("#autorole-" + index + " .rolename.noinput").html(face);
  $("#autorole-" + index + " .level.noinput").html(level);

  fetch("/admin/"+serverid+"/levelrole", {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(async res => {
    if (res.ok == true) {
      return true;
    } else {
      $("#autorole-" + index + " .rolename.noinput").html(original_F);
      $("#autorole-" + index + " .level.noinput").html(original_L);
      Swal.fire("ERROR", await res.json(), "error");
    }
  });
});

$("#levelroleslist").on("click",".lvlrole-del", function() {
  let role = $(this).data("role");
  let level = $(this).data("level");
  let index = $(this).data("index");

  Swal.fire({
    title: "Hey, are you sure?",
    text: "This will remove this Level Role.\n\n\u200b",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#AA66FF",
    cancelButtonColor: "#FC5065",
    confirmButtonText: "Yes",
    showLoaderOnConfirm: true,
    preConfirm: login => {
      return fetch("/admin/"+serverid+"/levelrole", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ role, level, validator, serverid })
      })
        .then(async res => {
          if (res.ok == true) return res;
          else throw new Error(await res.json());
        })
        .catch(error => {
          console.log(error);
          Swal.showValidationMessage(`Oopsie Woopsie: ${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then(result => {
    if (result.value) {
      Swal.fire({
        title: "Deleted!",
        text: "This Level Role is no more!",
        type: "success",
        confirmButtonText: "Poof!"
      });
      $(`#autorole-${index}`).remove();
    }
  });
});

$(".del-rea-rol").click(function() {
  let channel = $(this).data("channel");
  let message = $(this).data("message");

  Swal.fire({
    title: "Hey, are you sure?",
    text: "This will remove this Reaction Role and the message.\n\n\u200b",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#AA66FF",
    cancelButtonColor: "#FC5065",
    confirmButtonText: "Yes",
    showLoaderOnConfirm: true,
    preConfirm: login => {
      return fetch("/admin/"+serverid+"/reactionrole", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ channel, message, validator, serverid })
      })
        .then(async res => {
          if (res.ok == true) return res;
          else throw new Error(await res.json());
        })
        .catch(error => {
          console.log(error);
          Swal.showValidationMessage(`Oopsie Woopsie: ${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then(result => {
    if (result.value) {
      Swal.fire({
        title: "Deleted!",
        text: "This message is no more!",
        type: "success",
        confirmButtonText: "Poof!"
      });
      $(`#${message}`).remove();
    }
  });
});

$("#new-lev-role").submit(function(e) {
  e.preventDefault();
  //$("#levrole-select").selected.val()
  let role = $("#levrole-select").val();
  let level = this.level.value;
  let payload = { role, level, validator, serverid };

  fetch("/admin/"+serverid+"/levelrole", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(async res => {
    if (res.ok == true) {
       let blobb = await res.blob();
        $("#levelroleslist").append( await blobb.text() );
 console.log(blobb)
    } else Swal.fire("ERROR", await res.json(), "error");
  });
});

//--------------------------------------------------------------------------------------------------

$("#selfroleslist").on("submit",".selfrole_item", function(e) {
  //$(".selfrole_item").submit(function(e) {
    e.preventDefault();
  
    let role = this["selfrole-select-2"].value;
    let short = this.short.value;
    let face = this["selfrole-select-2"][this["selfrole-select-2"].selectedIndex]
      .innerHTML;
  
    let index = $(this).data("index");
    let payload = { role, short, validator, serverid, index };
    let original_F = $("#selfrole-" + index + " .rolename.noinput").html();
    let original_L = $("#selfrole-" + index + " .level.noinput").html();
    $("#selfrole-" + index + " .rolename.noinput").html(face);
    $("#selfrole-" + index + " .level.noinput").html(short);
  
    fetch("/admin/"+serverid+"/selfrole", {
      method: "PATCH",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (res.ok == true) {
        return true;
      } else {
        $("#selfrole-" + index + " .rolename.noinput").html(original_F);
        $("#selfrole-" + index + " .level.noinput").html(original_L);
        Swal.fire("ERROR", await res.json(), "error");
      }
    });
  });
  
  $("#selfroleslist").on("click",".selfrole-del", function() {
    let role = $(this).data("role");
    let short = $(this).data("level");
    let index = $(this).data("index");
  
    Swal.fire({
      title: "Hey, are you sure?",
      text: "This will remove this Command Role.\n\n\u200b",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#AA66FF",
      cancelButtonColor: "#FC5065",
      confirmButtonText: "Yes",
      showLoaderOnConfirm: true,
      preConfirm: login => {
        return fetch("/admin/"+serverid+"/selfrole", {
          method: "DELETE",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ role, short, validator, serverid })
        })
          .then(async res => {
            if (res.ok == true) return res;
            else throw new Error(await res.json());
          })
          .catch(error => {
            console.log(error);
            Swal.showValidationMessage(`Oopsie Woopsie: ${error}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(result => {
      if (result.value) {
        Swal.fire({
          title: "Deleted!",
          text: "This Command Role is no more!",
          type: "success",
          confirmButtonText: "Poof!"
        });
        $(`#selfrole-${index}`).remove();
      }
    });
  }); 

  //--------------------------------------------------------------------------------------------------


$("#new-self-role").submit(function(e) {
  e.preventDefault();
  //$("#levrole-select").selected.val()
  let role = $("#selfrole-select").val();
  let short = this.short.value;
  let payload = { role, short, validator, serverid };

  fetch("/admin/"+serverid+"/selfrole", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(async res => {
    if (res.ok == true) {
       let blobb = await res.blob();
        $("#selfroleslist").append( await blobb.text() );
 console.log(blobb)
    } else Swal.fire("ERROR", await res.json(), "error");
  });
});

$('.plx-pink-check input').change(function(){
  
  const data_payload = gatherData();
  let opt = {};
    
  if (this.id == "global-prefix-toggle" ) opt= { f_name: "Global Prefix",param: data_payload.prefixToggle  };
  if (this.id == "rolestack-toggle" )     opt= { f_name: "Level Roles Stack",param: data_payload.rolestack  };
  if (this.id == "server-prefix" )        opt= { f_name: "Server Prefix",param: data_payload.prefix  };
  if (this.id == "levelup-local" )        opt= { f_name: "Level Up Message [LOCAL]",param: data_payload.lvup_loc  };
  if (this.id == "levelup-global" )       opt= { f_name: "Level Up Message [GLOBAL]",param: data_payload.lvup_glb  };
  if (this.id == "level-message" )        opt= { f_name: "Level Up Message",param: data_payload.l_mess  };
  if (this.id == "update-alerts" )        opt= { f_name: "Update Hooks",param: data_payload.updates };
  if (this.id == "modrole-select" )       opt= { f_name: "Administrative Role",param: data_payload.modrole };
  if (this.id == "muterole-select" )      opt= { f_name: "MUTE Role",param: data_payload.muterole  };
  if (this.id == "welcome-channel" )      opt= { f_name: "Welcome Channel",param: data_payload.w_chan  };
  if (this.id == "welcome-message" )      opt= { f_name: "Welcome Message",param: data_payload.w_mess  };
  if (this.id == "welcome-toggle" )       opt= { f_name: "Welcome Toggle",param: data_payload.w_togg  };
  if (this.id == "bye-channel" )          opt= { f_name: "Farewell Channel",param: data_payload.b_chan  };
  if (this.id == "bye-message" )          opt= { f_name: "Farewell Message",param: data_payload.b_mess  };
  if (this.id == "bye-toggle" )           opt= { f_name: "Farewell Toggle",param: data_payload.b_togg  };
  if (this.id == "welcome-img" )          opt= { f_name: "Welcom Image",param: data_payload.w_img };
  if (this.id == "respond-disabled" )     opt= { f_name: "Disabled Command Feedback",param: data_payload.res_disa  };
  if (this.id == "command-toggle" )       opt= { f_name: "Command Toggle",param: data_payload.cmd_disas };
  if (this.id == "loot-drops" )           opt= { f_name: "Lootbox Drops",param: data_payload.drops };

  if(!opt.f_name) return;

  return fetch("/admin/"+serverid+"/save", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ data: data_payload, serverid, noDM: true })
  }).then(async res => {
    if(res.ok)
        PLX.notification('<div class="plx-flex plx-flex-between"> <span style="align-text:left; flex-shrink: 0"> Updated: '+ opt.f_name+ '</span><span style="align-text:right">'+ (opt.param === false ? '❌' : opt.param === true ? '✔' : opt.param) +"</span>" );
    else
        PLX.notification('<div class="plx-flex plx-flex-between"> <span style="align-text:left; flex-shrink: 0"> Error: '  + opt.f_name+ '</span><span style="align-text:right">'+ (opt.param === false ? '❌' : opt.param === true ? '✔' : opt.param )+"</span>" );
  });

  
})

$("#save-all").click(function() {
  const data_payload = gatherData(); 
  return fetch("/admin/"+serverid+"/save", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ data: data_payload, serverid })
  }).then(async res => {
    if(res.ok)
        PLX.notification("Settings Saved!");
    else
        PLX.notification("Settings Saved!");
  });
});

$("#save-command-switch").click(function() {
  console.log('save cmd')
  let respond = $('#respond-disabled')[0].checked;
  let disabled = Object.values($('.command-toggle')).filter(e=> !e.checked).map(e=> e.name).filter(e=>!!e);
  let payload = { respond, disabled,validator, serverid };
  fetch("/admin/"+serverid+"/commandswitch", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(async res => {
    if (res.ok) PLX.notification("Command Switch Updated!")
    else  Swal.fire("ERROR", await res.json(), "error");
  })
  
})


var langsel
var _ddlLoaded


(function(e){e.fn.ddslick=function(l){if(c[l]){return c[l].apply(this,Array.prototype.slice.call(arguments,1))}else{if(typeof l==="object"||!l){return c.init.apply(this,arguments)}else{e.error("Method "+l+" does not exists.")}}};var c={},d={data:[],keepJSONItemsOnTop:false,width:280,height:null,background:"#eee",selectText:"",defaultSelectedIndex:null,truncateDescription:true,imagePosition:"left",showSelectedHTML:true,clickOffToClose:true,embedCSS:true,onSelected:function(){}},i='<div class="dd-select"><input class="dd-selected-value" type="hidden" /><a class="dd-selected"></a><span class="dd-pointer dd-pointer-down"></span></div>',a='<ul class="dd-options"></ul>',b='<style id="css-ddslick" type="text/css">.dd-select{ border-radius:2px; border:solid 1px #ccc; position:relative; cursor: url(/cur/pointer.png), pointer;}.dd-desc { color:#aaa; display:block; overflow: hidden; font-weight:normal; line-height: 1.4em; }.dd-selected{ overflow:hidden; display:block; padding:10px; font-weight:bold;}.dd-pointer{ width:0; height:0; position:absolute; right:10px; top:50%; margin-top:-3px;}.dd-pointer-down{ border:solid 5px transparent; border-top:solid 5px #000; }.dd-pointer-up{border:solid 5px transparent !important; border-bottom:solid 5px #000 !important; margin-top:-8px;}.dd-options{ border:solid 1px #ccc; border-top:none; list-style:none; box-shadow:0px 1px 5px #ddd; display:none; position:absolute; z-index:2000; margin:0; padding:0;background:#fff; overflow:auto;}.dd-option{ padding:10px; display:block; border-bottom:solid 1px #ddd; overflow:hidden; text-decoration:none; color:#333; cursor: url(/cur/pointer.png), pointer;-webkit-transition: all 0.25s ease-in-out; -moz-transition: all 0.25s ease-in-out;-o-transition: all 0.25s ease-in-out;-ms-transition: all 0.25s ease-in-out; }.dd-options > li:last-child > .dd-option{ border-bottom:none;}.dd-option:hover{ background:#f3f3f3; color:#000;}.dd-selected-description-truncated { text-overflow: ellipsis; white-space:nowrap; }.dd-option-selected { background:#f6f6f6; }.dd-option-image, .dd-selected-image { vertical-align:middle; float:left; margin-right:5px; max-width:64px;}.dd-image-right { float:right; margin-right:15px; margin-left:5px;}.dd-container{ position:relative;}​ .dd-selected-text { font-weight:bold}​</style>';c.init=function(l){var l=e.extend({},d,l);if(e("#css-ddslick").length<=0&&l.embedCSS){e(b).appendTo("head")}return this.each(function(){var p=e(this),q=p.data("ddslick");if(!q){var n=[],o=l.data;p.find("option").each(function(){var w=e(this),v=w.data();n.push({text:e.trim(w.text()),value:w.val(),selected:w.is(":selected"),description:v.description,imageSrc:v.imagesrc})});if(l.keepJSONItemsOnTop){e.merge(l.data,n)}else{l.data=e.merge(n,l.data)}var m=p,s=e('<div id="'+p.attr("id")+'"></div>');p.replaceWith(s);p=s;p.addClass("dd-container").append(i).append(a);var n=p.find(".dd-select"),u=p.find(".dd-options");u.css({width:l.width});n.css({width:l.width,background:l.background});p.css({width:l.width});if(l.height!=null){u.css({height:l.height,overflow:"auto"})}e.each(l.data,function(v,w){if(w.selected){l.defaultSelectedIndex=v}u.append('<li><a class="dd-option">'+(w.value?' <input class="dd-option-value" type="hidden" value="'+w.value+'" />':"")+(w.imageSrc?' <img class="dd-option-image'+(l.imagePosition=="right"?" dd-image-right":"")+'" src="'+w.imageSrc+'" />':"")+(w.text?' <label class="dd-option-text">'+w.text+"</label>":"")+(w.description?' <small class="dd-option-description dd-desc">'+w.description+"</small>":"")+"</a></li>")});var t={settings:l,original:m,selectedIndex:-1,selectedItem:null,selectedData:null};p.data("ddslick",t);if(l.selectText.length>0&&l.defaultSelectedIndex==null){p.find(".dd-selected").html(l.selectText)}else{var r=(l.defaultSelectedIndex!=null&&l.defaultSelectedIndex>=0&&l.defaultSelectedIndex<l.data.length)?l.defaultSelectedIndex:0;j(p,r)}p.find(".dd-select").on("click.ddslick",function(){f(p)});p.find(".dd-option").on("click.ddslick",function(){j(p,e(this).closest("li").index())});if(l.clickOffToClose){u.addClass("dd-click-off-close");p.on("click.ddslick",function(v){v.stopPropagation()});e("body").on("click",function(){e(".dd-click-off-close").slideUp(50).siblings(".dd-select").find(".dd-pointer").removeClass("dd-pointer-up")})}}})};c.select=function(l){return this.each(function(){if(l.index!==undefined){j(e(this),l.index)}})};c.open=function(){return this.each(function(){var m=e(this),l=m.data("ddslick");if(l){f(m)}})};c.close=function(){return this.each(function(){var m=e(this),l=m.data("ddslick");if(l){k(m)}})};c.destroy=function(){return this.each(function(){var n=e(this),m=n.data("ddslick");if(m){var l=m.original;n.removeData("ddslick").unbind(".ddslick").replaceWith(l)}})};function j(q,s){var u=q.data("ddslick");var r=q.find(".dd-selected"),n=r.siblings(".dd-selected-value"),v=q.find(".dd-options"),l=r.siblings(".dd-pointer"),p=q.find(".dd-option").eq(s),m=p.closest("li"),o=u.settings,t=u.settings.data[s];q.find(".dd-option").removeClass("dd-option-selected");p.addClass("dd-option-selected");u.selectedIndex=s;u.selectedItem=m;u.selectedData=t;if(o.showSelectedHTML){r.html((t.imageSrc?'<img class="dd-selected-image'+(o.imagePosition=="right"?" dd-image-right":"")+'" src="'+t.imageSrc+'" />':"")+(t.text?'<label class="dd-selected-text">'+t.text+"</label>":"")+(t.description?'<small class="dd-selected-description dd-desc'+(o.truncateDescription?" dd-selected-description-truncated":"")+'" >'+t.description+"</small>":""))}else{r.html(t.text)}n.val(t.value);u.original.val(t.value);q.data("ddslick",u);k(q);g(q);if(typeof o.onSelected=="function"){o.onSelected.call(this,u)}}function f(p){var o=p.find(".dd-select"),m=o.siblings(".dd-options"),l=o.find(".dd-pointer"),n=m.is(":visible");e(".dd-click-off-close").not(m).slideUp(50);e(".dd-pointer").removeClass("dd-pointer-up");if(n){m.slideUp("fast");l.removeClass("dd-pointer-up")}else{m.slideDown("fast");l.addClass("dd-pointer-up")}h(p)}function k(l){l.find(".dd-options").slideUp(50);l.find(".dd-pointer").removeClass("dd-pointer-up").removeClass("dd-pointer-up")}function g(o){var n=o.find(".dd-select").css("height");var m=o.find(".dd-selected-description");var l=o.find(".dd-selected-image");if(m.length<=0&&l.length>0){o.find(".dd-selected-text").css("lineHeight",n)}}function h(l){l.find(".dd-option").each(function(){var p=e(this);var n=p.css("height");var o=p.find(".dd-option-description");var m=l.find(".dd-option-image");if(o.length<=0&&m.length>0){p.find(".dd-option-text").css("lineHeight",n)}})}})(jQuery);
$("#next").html("FINISH")
$('#lang').ddslick({
    height: '40vh',
    onSelected: function (s) {
        if(!_ddlLoaded ) return _ddlLoaded = true;


        langsel = (s.selectedData.value);
        return fetch("/admin/"+serverid+"language", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ data: s.selectedData.value, serverid })
        }).then(async res => {
            if(res.ok)
                PLX.notification('Language saved: '+ s.selectedData.text,'primary');
            else
                PLX.notification('Language Error: '+ s.selectedData.text,'danger');

            
        })
    }
});



 /*
  const  observer = new MutationObserver((mus)=>{
    for(let mu of mus) {
      if (mu.target.className == "plx-pink-check"){
        console.log("Langchange: "+mu.target)
      }
    }
  });
observer.observe($('.plx-pink-check')[0], { attributes: true});
*/

})