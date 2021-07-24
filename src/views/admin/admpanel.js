$(document).ready(function(){

    $(".markall").click(function () {
        var cat = $(this).data('cat')
        $('.cat_' + cat +' input').prop('checked', this.checked);
    })

})



function gatherData(){

    const payload = {
     upfactorA: PROGEDIT.A
    ,upfactorB: PROGEDIT.B
    ,prefixToggle: $('#global-prefix-toggle').prop('checked')
    ,rolestack: $('#rolestack-toggle').prop('checked')
    ,prefix: $('#server-prefix').val() ||"+"
 
    ,lvup_loc: $('#levelup-local').prop('checked')
    ,lvup_glb: $('#levelup-global').prop('checked')
    ,l_mess: $('#levelup-message').val()
    ,updates: $('#update-alerts').prop('checked')
    ,drops: $('#loot-drops').prop('checked')

    ,language: $('.dd-selected-value').val()

    ,modrole: $('#modrole-select').val()
    ,muterole: $('#muterole-select').val()

    ,w_chan: $('#welcome-channel').val()
    ,w_mess: $('#welcome-message').val() || ""
    ,w_togg: $('#welcome-toggle').prop('checked')
    ,w_time: 0 //$('#welcome-timer').val()

    ,b_chan: $('#bye-channel').val()
    ,b_mess: $('#bye-message').val() || ""
    ,b_togg: $('#bye-toggle').prop('checked')
    ,b_time: 0 //$('#bye-timer').val()
    
    ,w_img:$('#welcome-img').prop('checked')

    ,res_disa: $('#respond-disabled').prop('checked')    
    ,cmd_disas:  $('.command-toggle').filter((v,i,a)=> !i.checked ).map((v,i,a)=> i.name )
    }
    
   console.log(payload)
   return payload;

} 