$(document).ready(function () {

  $(".sadasfdsaf").click(function (e) {
e.preventDefault()


    $.get(this.href, function (data) {
      processAjaxData(data, this.href)
      $("#bods").html(data);
    });
  })
  $(document).keydown(function (e) {
    if (e.keyCode == 8) {
      e.preventDefault();
      var oldURL = document.referrer;
      alert(oldURL);

    }
  });

  window.onpopstate = function (e) {
    if (e.state) {
      $("body").html = e.state.html;
      document.title = e.state.pageTitle;
    }
  };

  function processAjaxData(response, urlPath) {


    console.log(response.html)
    console.log(urlPath)
    $("#bods").html = response.html;
    document.title = response.pageTitle;
    window.history.pushState({
      "html": response.html,
      "pageTitle": response.pageTitle
    }, "", urlPath);
  }



  var i = 0

  var texts = [
 "Constantly updated",
 "Neat currency system with shops",
 "The best Lootbox system around!",
 "Basic moderation options",
 "Unique fun commands that explore either the unusual or the ridiculous",
 "Multiple Languages",
 "Very ladylike~",
 "All responses carefully designed to look pretty",
 "Lightning fast user support!",
 "Highly customizable",
 "Original artwork",
 "Are you still reading this?",
 "Can you please just click on something?",
 "I mean, there's nothing for you to do here",
 "Except for staring at these messages",
 "I bet you're just here now to see how far does this go",
 "Well, pretty far, I suggest you getting a coffee",
 "...and putting some music",
 "because this will most likely take a fraction of forever",
 "...",
 "please, go do something, stop staring!",
 "Think quick: what is the square root of 472899?",
 "You're wrong!",
 "I don't know either but at least I didn't even try",
 "...",
 "You've been around for a while huh?",
 "Well, you seem to be patient",
 "I'll reward your patience with something",
 "How about revealing some easter eggs?",
 "Did you know that saying 'STANDO' during a Blackjack match adds a Jojo effect to it?",
 "Now get away and go try it",
 "...",
 "You're really stubborn aren't you?",
 "If you go to my server now I'll give you 1000 Rubines",
 "Go now!",
 "If you're still here, good. Because I was lying",
 "Are you lost?",
 "Well, you might want to know what I can do",
 "so I will tell you my feats"

 ]

  setInterval(function () {
    ++i
    if (i == texts.length) i = 0;
    console.log(texts[i])
    $("#marq").html(texts[i])
  }, 4800)



  // return
  /// setTimeout(function(){

  // $.get( "/comprev", function( data ) {



  // $( "body" ).html( data );
  //  });

  //  },3000)



});

