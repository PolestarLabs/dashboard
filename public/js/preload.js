$("html").addClass('cl-preload');
$(window).on('load', function() {
    $("#loader").fadeOut("slow", function() {
        $("#preloader").delay(300).fadeOut("slow");
    });             
    $("html").removeClass('cl-preload');
    $("html").addClass('cl-loaded');        
});  
