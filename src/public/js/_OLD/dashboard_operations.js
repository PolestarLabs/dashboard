 /*!
 * jQuery Simulate v1.0.0 - simulate browser mouse and keyboard events
 * https://github.com/jquery/jquery-simulate
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: 2014-08-22
 */

;(function( $, undefined ) {

var rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/;

$.fn.simulate = function( type, options ) {
	return this.each(function() {
		new $.simulate( this, type, options );
	});
};

$.simulate = function( elem, type, options ) {
	var method = $.camelCase( "simulate-" + type );

	this.target = elem;
	this.options = options;

	if ( this[ method ] ) {
		this[ method ]();
	} else {
		this.simulateEvent( elem, type, options );
	}
};

$.extend( $.simulate, {

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	},

	buttonCode: {
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2
	}
});

$.extend( $.simulate.prototype, {

	simulateEvent: function( elem, type, options ) {
		var event = this.createEvent( type, options );
		this.dispatchEvent( elem, type, event, options );
	},

	createEvent: function( type, options ) {
		if ( rkeyEvent.test( type ) ) {
			return this.keyEvent( type, options );
		}

		if ( rmouseEvent.test( type ) ) {
			return this.mouseEvent( type, options );
		}
	},

	mouseEvent: function( type, options ) {
		var event, eventDoc, doc, body;
		options = $.extend({
			bubbles: true,
			cancelable: (type !== "mousemove"),
			view: window,
			detail: 0,
			screenX: 0,
			screenY: 0,
			clientX: 1,
			clientY: 1,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			button: 0,
			relatedTarget: undefined
		}, options );

		if ( document.createEvent ) {
			event = document.createEvent( "MouseEvents" );
			event.initMouseEvent( type, options.bubbles, options.cancelable,
				options.view, options.detail,
				options.screenX, options.screenY, options.clientX, options.clientY,
				options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
				options.button, options.relatedTarget || document.body.parentNode );

			// IE 9+ creates events with pageX and pageY set to 0.
			// Trying to modify the properties throws an error,
			// so we define getters to return the correct values.
			if ( event.pageX === 0 && event.pageY === 0 && Object.defineProperty ) {
				eventDoc = event.relatedTarget.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				Object.defineProperty( event, "pageX", {
					get: function() {
						return options.clientX +
							( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
							( doc && doc.clientLeft || body && body.clientLeft || 0 );
					}
				});
				Object.defineProperty( event, "pageY", {
					get: function() {
						return options.clientY +
							( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
							( doc && doc.clientTop || body && body.clientTop || 0 );
					}
				});
			}
		} else if ( document.createEventObject ) {
			event = document.createEventObject();
			$.extend( event, options );
			// standards event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
			// old IE event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ms533544(v=vs.85).aspx
			// so we actually need to map the standard back to oldIE
			event.button = {
				0: 1,
				1: 4,
				2: 2
			}[ event.button ] || ( event.button === -1 ? 0 : event.button );
		}

		return event;
	},

	keyEvent: function( type, options ) {
		var event;
		options = $.extend({
			bubbles: true,
			cancelable: true,
			view: window,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			keyCode: 0,
			charCode: undefined
		}, options );

		if ( document.createEvent ) {
			try {
				event = document.createEvent( "KeyEvents" );
				event.initKeyEvent( type, options.bubbles, options.cancelable, options.view,
					options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
					options.keyCode, options.charCode );
			// initKeyEvent throws an exception in WebKit
			// see: http://stackoverflow.com/questions/6406784/initkeyevent-keypress-only-works-in-firefox-need-a-cross-browser-solution
			// and also https://bugs.webkit.org/show_bug.cgi?id=13368
			// fall back to a generic event until we decide to implement initKeyboardEvent
			} catch( err ) {
				event = document.createEvent( "Events" );
				event.initEvent( type, options.bubbles, options.cancelable );
				$.extend( event, {
					view: options.view,
					ctrlKey: options.ctrlKey,
					altKey: options.altKey,
					shiftKey: options.shiftKey,
					metaKey: options.metaKey,
					keyCode: options.keyCode,
					charCode: options.charCode
				});
			}
		} else if ( document.createEventObject ) {
			event = document.createEventObject();
			$.extend( event, options );
		}

		if ( !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() ) || (({}).toString.call( window.opera ) === "[object Opera]") ) {
			event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
			event.charCode = undefined;
		}

		return event;
	},

	dispatchEvent: function( elem, type, event ) {
		if ( elem[ type ] ) {
			elem[ type ]();
		} else if ( elem.dispatchEvent ) {
			elem.dispatchEvent( event );
		} else if ( elem.fireEvent ) {
			elem.fireEvent( "on" + type, event );
		}
	},

	simulateFocus: function() {
		var focusinEvent,
			triggered = false,
			element = $( this.target );

		function trigger() {
			triggered = true;
		}

		element.bind( "focus", trigger );
		element[ 0 ].focus();

		if ( !triggered ) {
			focusinEvent = $.Event( "focusin" );
			focusinEvent.preventDefault();
			element.trigger( focusinEvent );
			element.triggerHandler( "focus" );
		}
		element.unbind( "focus", trigger );
	},

	simulateBlur: function() {
		var focusoutEvent,
			triggered = false,
			element = $( this.target );

		function trigger() {
			triggered = true;
		}

		element.bind( "blur", trigger );
		element[ 0 ].blur();

		// blur events are async in IE
		setTimeout(function() {
			// IE won't let the blur occur if the window is inactive
			if ( element[ 0 ].ownerDocument.activeElement === element[ 0 ] ) {
				element[ 0 ].ownerDocument.body.focus();
			}

			// Firefox won't trigger events if the window is inactive
			// IE doesn't trigger events if we had to manually focus the body
			if ( !triggered ) {
				focusoutEvent = $.Event( "focusout" );
				focusoutEvent.preventDefault();
				element.trigger( focusoutEvent );
				element.triggerHandler( "blur" );
			}
			element.unbind( "blur", trigger );
		}, 1 );
	}
});



/** complex events **/

function findCenter( elem ) {
	var offset,
		document = $( elem.ownerDocument );
	elem = $( elem );
	offset = elem.offset();

	return {
		x: offset.left + elem.outerWidth() / 2 - document.scrollLeft(),
		y: offset.top + elem.outerHeight() / 2 - document.scrollTop()
	};
}

function findCorner( elem ) {
	var offset,
		document = $( elem.ownerDocument );
	elem = $( elem );
	offset = elem.offset();

	return {
		x: offset.left - document.scrollLeft(),
		y: offset.top - document.scrollTop()
	};
}

$.extend( $.simulate.prototype, {
	simulateDrag: function() {
		var i = 0,
			target = this.target,
			options = this.options,
			center = options.handle === "corner" ? findCorner( target ) : findCenter( target ),
			x = Math.floor( center.x ),
			y = Math.floor( center.y ),
			coord = { clientX: x, clientY: y },
			dx = options.dx || ( options.x !== undefined ? options.x - x : 0 ),
			dy = options.dy || ( options.y !== undefined ? options.y - y : 0 ),
			moves = options.moves || 3;

		this.simulateEvent( target, "mousedown", coord );

		for ( ; i < moves ; i++ ) {
			x += dx / moves;
			y += dy / moves;

			coord = {
				clientX: Math.round( x ),
				clientY: Math.round( y )
			};

			this.simulateEvent( target.ownerDocument, "mousemove", coord );
		}

		if ( $.contains( document, target ) ) {
			this.simulateEvent( target, "mouseup", coord );
			this.simulateEvent( target, "click", coord );
		} else {
			this.simulateEvent( document, "mouseup", coord );
		}
	}
});

})( jQuery );




//$(window).on("load",function(){
if (!unsaved)var unsaved;

// PICK BACKGROUND OPTION
$(window).bind('beforeunload', function(){
  if(unsaved===true){
  return 'wait';
  }
});


$(".itm").click(function () {
    $(".pgs").hide()
  $(".itm").removeClass("is-active")
  $(this).addClass("is-active")
  console.log($(this).data("target"))
  $("#"+ $(this).data("target")).show()
})


$(".stkpick img").click(function () {
  $('html, body, .nano-content').animate({ scrollTop: 0 }, 'fast');
  
  $(".userstik").attr("src", $(this).attr('src'))
  $("#savestk").removeAttr("disabled")
   unsaved = true;
})
$("#savestk").click(function () {
  var d = $("#userstik").attr("src");
  var data = d.replace("/build/stickers/", "").replace(".png", "");
  commit("sticker", data)
})


$(".bgpick img ").click(function () {
  $('html, body, .nano-content').animate({ scrollTop: 0 }, 'fast');
  
  $(".userbg").attr("src", $(this).attr('src'))
  $("#savebg").removeAttr("disabled")
   unsaved = true;
})

// BACKGROUND COMMIT
 
$("#savebg").click(function () {
  var d = $("#userbg").attr("src");
  var data = d.replace("/backdrops/", "").replace(".png", "");
  commit("background", data)
})
$("#previewbg").click(function () {
  var d = $("#userbg").attr("src");
        $("#userbp").attr("src", d)

})


$("#previewmedals").click(function () {
  var data = JSON.parse(localStorage.getItem("medals"))
  refreshMeds(data)
})


$("#savemedals,#scnd2").click(function () {
  var data = JSON.parse(localStorage.getItem("medals"))

  commit("medals", data)
})


$("#prevabout").click(function () {
  var data = $("#abo").val()
  $("#ptxmock").html(data)

  $("#resetabout").click(function () {
  var data = $("#ptxtdef").html()
  console.log(data)
  $("#ptxmock").html(data)
  $("#abo").val(data)
  })
  })

$("#saveabout").click(function () {
  var data = $("#abo").val()


    if (data == "") {

    swal({
      title: "Save it Empty?",
      text: "You are saving nothing as your personal text, are you sure?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d61c1c",
      confirmButtonText: "No, lemme fix it!",
      cancelButtonColor: "#1c47d6",
      cancelButtonText: "Yes, I'm sure",


    }, function (isConfirm) {
      if (isConfirm) {
        return;
      } else {
        commit("about", data)
      }
    })
  }else{
        commit("about", data)

  }



})


$("#allsave").click(function () {

  var data = {};
  var d = $("#userbg").attr("src");
  data.bg = d.replace("/backdrops/", "").replace(".png", "");
  data.md = JSON.parse(localStorage.getItem("medals"));
  data.tx = $("#abo").val();
  commit("all",data)

})

$("#allprev").click(function () {

  var data = {};
  var d = $("#userbg").attr("src");
  data.bg = d.replace("/backdrops/", "").replace(".png", "");
  data.md = JSON.parse(localStorage.getItem("medals"));
  data.tx = $("#abo").val();
      refreshMeds(data.md);
        $("#ptxmock").html(data.tx);
        var pdata = "/backdrops/" + data.bg + ".png";
        $("#userbp").attr("src", pdata)

})



function commit(op, data) {

  // setTimeout(function () {
  var postage = $.post("/commitProfile", {
    operation: op,
    data: data
  })
  
  console.log(postage.done())

  //==>
  postage.done(function (res) {
    console.log(res)

    swal({
      title: res.t||"All set!",
      text: res.m,
      type: res.s,
      confirmButtonColor: res.c,
      confirmButtonText: res.b,

      // showLoaderOnConfirm: true,
    }, function () {
        if (res.s != "success") return;
          unsaved = false;
      if (op=="medals")refreshMeds(data);
      if (op=="about")$("#ptxmock").html(data);
      if (op=="background"){
        var pdata = "/backdrops/"+data+".png";
        $("#userbp").attr("src", pdata)
         $("#bgov").attr("src", pdata)
        }
      if (op == "all") {

        refreshMeds(data.md);
        $("#ptxmock").html(data.tx);
        var pdata = "/backdrops/" + data.bg + ".png";
        $("#userbp").attr("src", pdata)
      }
      // $("#savebg").addAttr("disabled")
    })

    /*
    if (res.stats == "") {



    }
    if (res.stats == "") {

    }
    if (res.stats == "") {

    }
      */

  })
  //  }, 2000)

}



function isAuth() {
  $.post("/checklogin").fail(function () {
    window.location.replace("/auth");
  })
}



var correctCards = 0;
$(function () {

  var lastPlace;
  $(".cardPile").sortable({
    connectWith: ".sortable"
  })
  $(".cardPile li, .slotya li").disableSelection();
  $('.drag').draggable({
    connectWith: ".sortable",
    revert: "invalid",
    helper: 'clone',
    cursorAt:{
    top: 50,
    left: 50},
    appendTo: 'body',
    zIndex: 9
      //    , snap: "#slots ul li"
      //   , snapMode: "inner"
      //    , snapTolerance: 40

      ,
    start: function (event, ui) {
      $(this).hide()
      $(this).css({
        'cursor': 'grabbing',

      });
      lastPlace = $(this).parent();
    },
    stop: function (event, ui) {
      seeEquips()
      $(this).show()
      $(this).css({
        'cursor': 'grab'
      });
      lastPlace = $(this).parent();
    }
  });
  $('.dropB').droppable({
    connectWith: ".sortable",

    drop: function (event, ui) {
      $(this).removeClass("over")
      $(this).removeClass("dropa")

      $(lastPlace).removeClass("dropt")
      var dropped = ui.draggable;
      var droppedOn = this;
      $(dropped).detach().prependTo($(droppedOn));
      //$(dropped).detach().css({top: 0,left: 0}).prependTo($(droppedOn));
    }
  })


  $('.drop').droppable({
    hoverClass: "dropa",
    over: function (event, ui) {
      $(this).addClass("over")
    },
    out: function (event, ui) {
      $(this).removeClass("over")
    },
    drop: function (event, ui) {

      seeEquips()


      $(this).removeClass("over")
      $(lastPlace).removeClass("dropt")
      $(this).addClass("dropt")
        $("#savemedals,scnd2").removeAttr("disabled")
      console.log("DROP  " + this)
      var dropped = ui.draggable;
      var droppedOn = this;
      if ($(droppedOn).children().length > 0) {
        $(droppedOn).children().detach().prependTo($(lastPlace));
      }
      $(dropped).detach().prependTo($(droppedOn));
      // .css({top: 0,left: 0})
    }
  });
});
$("#medalreset").click(function() {
    var draggables = $(".medalSlot .drag");
    var    droppable = $(".cardPile").droppable();

draggables.each(function () {
                droppable = $(".cardPile").droppable();
				draggable = $(this).draggable();
                droppableOffset = droppable.offset(),
                draggableOffset = draggable.offset(),
                dx = droppableOffset.left - draggableOffset.left,
                dy = droppableOffset.top - draggableOffset.top;

        draggable.simulate("drag", {
            dx: dx,
            dy: dy
        });
})

    });

function seeEquips() {
  var medals = []
  var slots = $("#equipped").children();
  
  for (i = 0; i < slots.length; i++) {
    try {
  
      medals.push(slots[i].children[0].children[0].dataset.medal)

    } catch (e) {
      medals.push(0)

    }
  }
  unsaved = true;
  $("#savemedals,scnd2").removeAttr("disabled")
  localStorage.setItem("medals",JSON.stringify(medals));

}

function refreshMeds(medals){
  var data =""
  for (i=0; i<8;i++){
    data += '<img src="/medals/'+medals[i][0]+'.png">'
  }
  $("#medalmocks").html(data)

}



        var options = {
          useEasing: true,
          useGrouping: true,
          separator: '.',
          decimal: '.',
        };

      function count(){

        $.each($('.countup'), function (X) {
          var count = $(this).data("count"),
              st = $(this).data("start") || 0,
              t = $(this).data("time") || 0,
              off = $(this).data("offset") || 0,
              numAnim = new CountUp(this, st, count, 0,t,options);
            setTimeout(function(){

              numAnim.start();
            },X*100-off)
          });
      }
count()



