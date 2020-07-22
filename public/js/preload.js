$("html").addClass("cl-preload");
$(window).on("load", function () {
  $("#loader").fadeOut("slow", function() {
   $("#preloader").delay(100).fadeOut("slow");
  });
  $("html").removeClass("cl-preload");
  $("html").addClass("cl-loaded");
});

window.onbeforeunload = function (e) {
    $("#loader").delay(300).hide()
  $("#preloader").fadeIn("fast", function () {
    $("#preloader").animate({ opacity: 1 });
  });
};
window.paceOptions = {ajax:false, restartOnRequestAfter: 300 ,ghostTime: 100,restartOnPushState: false}; Pace.options.restartOnPushState = false; console.log(Pace.options)