$(document).ready(function(){

return;
    $(".rankitxem").each(function(i){
        let item = $(this);
        setTimeout(function(){            
            fetch('/lesaderboards/discorduser/'+item.data('id')+"?=.png").then(res=>{
                res.json().then(res=>{
                    $(`#rank${i} .user_avatar`).attr('src',res.avatar);
                    $(`#rank${i} .user_name`).html(res.name);
                    $(`#rank${i} .user_dsc`).html(res.disc);
                    $(`#rank${i} .lv`).html(res.level);
                    $(`#rank${i} .exp`).html(res.exp);
                    $(`#rank${i} .sub_bg`).attr('src',`/backdrops/${res.bg}.png`);
                }) 
            })            
        },i*500)
    })

}) 