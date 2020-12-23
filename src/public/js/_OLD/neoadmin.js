var langsel = 'en'
var def = {
  act: {
    userJoin: true,
    userLeave: true,
    messDel: false,
    messEdit: false
  },
  mod: {
    usrBan: true,
    usrKick: true,
    usrMute: true,
    usrUnmute: true
  },
  adv: {
    newChan: false,
    newRole: false,
    permsEdit: false,
    revokeBan: true,
    uptRole: false,
    delChan: false,
    usrNick: true,
    usrPhoto: false,
    usrRoles: false
  }
};
slogs ? slogs = slogs : slogs = def;


// READY //=============================

function getPayload_mod() {
  var menspanum = Number($('#mention_thres').val()) || 3;
  var payload = {
    "logging": $('#checklf').prop('checked'),
    "splitLogs": $('#splitchk').prop('checked'),
    "modules.LOGCHANNEL": $('#logcha').find(':selected')[0].id,
    "modules.ADVLOG": $('#logchaAD').find(':selected')[0].id,
    "modules.ACTLOG": $('#logchaAC').find(':selected')[0].id,
    "modules.MODLOG": $('#logchaMD').find(':selected')[0].id,
    "modules.BUSTER.switches.mentionSpam": $('#mention_o').prop('checked'),
    "modules.BUSTER.switches.links": $('#links_o').prop('checked'),
    "modules.BUSTER.switches.invites": $('#invites_o').prop('checked'),
    "modules.BUSTER.switches.words": $('#words_o').prop('checked'),
    "modules.BUSTER.bypass.mentionSpam": $('#mention_bypass').find(':selected')[0].id,
    "modules.BUSTER.bypass.links": $('#link_bypass').find(':selected')[0].id,
    "modules.BUSTER.bypass.invites": $('#invite_bypass').find(':selected')[0].id,
    "modules.BUSTER.bypass.words": $('#words_bypass').find(':selected')[0].id,
    "modules.BUSTER.params.mentionSpam": menspanum,
    "modules.BUSTER.params.links": $('#link_filter').val().replace(/ +/, '').split('\n'),
    "modules.BUSTER.params.invites": $('#invite_filter').val().replace(/ +/, '').split('\n')
  }
  var str = $('#words_filter').val()
  str = str.replace(/^[,\s]+|[,\s]+$/g, '');
  str = str.replace(/\s*,\s*/g, ';');
  payload["modules.BUSTER.params.words"] = str.split(';').filter((val) => val);

  return payload;
};

function save(payload, message) {
 console.log(payload, message);

  $.when($.post("/process/save_db_payload", {
    payload,
    server: SERVER_ID,
    mee: message
  })).then(data => {
    console.log(data)
    if (data == 'ALRITE') swal({
      type: 'success',
      timer: 2000
    });
    else if (data == 'FORBIDDEN') swal('Error', "Don't XSS me yo piece of fuck!", 'error');
    else swal('Error', "", 'error');
  })
};

function opensidebar() {
  $('.sidepanel-bg').fadeIn()
  $('.sidepanel').css({
    "transform": "translateX(0)"
  });
};

function closeSide() {

  $('.sidepanel-bg').fadeOut()
  $('.sidepanel').css({
    "transform": "translateX(-130%)"
  });

};

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
};

function getChecks() {

  var serverlogs = slogs
  if (typeof serverlogs != "object") serverlogs = def;
  $(".check").each(function () {
    var classi = $(this).data("type")
    var item = $(this).data("key")
    if (item == undefined) return;
    serverlogs[classi][item] = this.checked
  })
  return {
    logs: serverlogs
  };
} // RETURNS <SERVER>.logs

function getPayload_globals() {

  let GREET = {
    enabled: $('#GREET_enabled').prop('checked'),
    text: $('#GREET_text').val(),
    timer: Number($('#GREET_hiDel').val()) * 1000,
    channel: $('#GREET_channel').find(':selected')[0].id
  };
  let FWELL = {
    enabled: $('#FWELL_enabled').prop('checked'),
    text: $('#FWELL_text').val(),
    timer: Number($('#FWELL_hiDel').val()) * 1000,
    channel: $('#FWELL_channel').find(':selected')[0].id
  };

  let disable_g = []
  $('.cat:not(:checked)').each(function () {
    disable_g.push($(this).data('cmd'));
  });

  var payload = {
    "modules.GREET": GREET,
    "modules.FWELL": FWELL,
    "modules.LANGUAGE": langsel,
    "modules.PREFIX": $('#prefix_select').val(),
    "modules.UPFACTOR": (Number($('#upfactor').val()) || 0.1),
    "globalPrefix": $('#global_prefix').prop('checked'),
    "disaReply": $('#relplydisabled').prop('checked'),
    "modules.LVUP": $('#lvup_o').prop('checked'),
    "modules.DROPS": $('#drops_o').prop('checked'),
    "modules.ANNOUNCE": $('#notices_o').prop('checked'),
    "imgwelcome": $('#pictopollux_o').prop('checked'),
    "modules.DISABLED": disable_g
  }

  return payload
};


// READY //=============================

$(document).ready(function () {

  $(".nano").nanoScroller();
  
  $("#gotoAdvan").click(function () {
    $("#goto_logs").click()

  });  
  $(".switches_o").click(function () {
    var tgt = "#c_" + $(this).data('target')
    console.log(tgt)
    console.log(this.checked)
    $(tgt).html(this.checked ? "  ON" : "  OFF")


  });

  if (location.hash.startsWith('#/')) {
    let pointer = location.hash.replace('#/', '')
    console.log(pointer)

    $('#goto_' + pointer).click()
  } else {
    $('#goto_basics').click()
  };
  
  
  $('.sidemenu').click(function () {
    opensidebar()
  })
  $('.sidepanel-bg').click(function () {
    closeSide()
  })
  $('.menu-list a').click(function () {
    closeSide()
    $('#loc').html($(this).html())
  })

  //------------------------
  //      GLOBALS
  //------------------------
  $(".check_wilk").click(function () {
    let tgt = $(this).data('target');
    let hecked = this.checked
    $(tgt).each(function () {
      console.log(hecked)
      $(this).prop('disabled', !hecked)
    })
  })
  $(".switches_o").click(function () {
    var tgt = "#c_" + $(this).data('target')
    console.log(tgt)
    $(tgt).html(this.checked ? "  ON" : "  OFF")
  })
  $(".markall").click(function () {
    var cat = $(this).data('cat')
    $('.cat.' + cat).prop('checked', this.checked);
  })
  //---
  $('#lang').ddslick({
    height: '40vh',
    onSelected: function (s) {
      langsel = (s.selectedData.value);
    }
  })
  //------------------------

  //===============================


  $(".savmod_button").click(function () {
   save(getPayload_mod(),"MODERATION SETTINGS")
  });

  $(".savglobals_button").click(function () {
    save(getPayload_globals(),"GLOBAL SERVER SETTINGS")
  });

  $('#saveLogs').click(function () {
    var postage = $.post("/advancedPy", {
      payload: payload
    })

    postage.done(function (res) {
      response(res)
    })
  });

  $(".savlog_button").click(function () {
    save(getChecks(),"LOGS OPTIONS")
  });





})




