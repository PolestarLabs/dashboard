// Set the date we're counting down to
var countDownDate = new Date("Nov 18, 2018 01:00:00 UTC").getTime();

var x = setInterval(function() {

  var now = new Date().getTime();

  var distance = countDownDate - now;

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

try{
  
  document.getElementById("cdw").innerHTML = (days?days+"d ":"") +( !hours||!days?"":hours+"h ")
  + (!minutes||!hours||!days?"":minutes + "m ") + seconds + "s ";
}catch(e){}


  if (distance < 21600000) {
    $("#cdw").addClass('tx-warning')
  }
  
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("cdw").innerHTML = "NOW";
  }
}, 1000);