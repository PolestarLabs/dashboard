
    $(document).ready(function(){
       setLang("en")
    })
    function setLang(lang) {
        //$("#placer").fadeOut()
        //setTimeout(function(){
        
        let dockHeight = $("#commands-dock").height()
        localStorage.setItem('locale', lang);
        console.log(lang)
         $.post("/cmlist?lang="+lang, function(data) {
            $("#commands-dock").height(dockHeight)
            $('#commands-dock').html(data)
            $("#commands-dock").height('auto')
            if($("#weirdNav")){
               $("#weirdNav").attr('plx-sticky',"bottom: #end; offset: 80")              
            }

         })

        //    },500)
        }

$('.genericFilter').click(function(){ 
   $("#weirdNav").hide()
   PLX.scrollspyNav("#weirdNav",{}).$destroy();
   $("#weirdNav").attr('plx-sticky',"bottom: #end; offset: 80")
})

$('#allFIlter').click(function(){
   $("#weirdNav").show()
   PLX.scrollspyNav("#weirdNav",{});
   $("#weirdNav").attr('plx-sticky',"bottom: #end; offset: 80")
})
