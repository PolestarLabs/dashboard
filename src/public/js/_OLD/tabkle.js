    function Animator(a){this.setOptions(a);var b=this;this.timerDelegate=function(){b.onTimerEvent()};this.subjects=[];this.state=this.target=0;this.lastTime=null} Animator.prototype={setOptions:function(a){this.options=Animator.applyDefaults({interval:20,duration:400,onComplete:function(){},onStep:function(){},transition:Animator.tx.easeInOut},a)},seekTo:function(a){this.seekFromTo(this.state,a)},seekFromTo:function(a,b){this.target=Math.max(0,Math.min(1,b));this.state=Math.max(0,Math.min(1,a));this.lastTime=(new Date).getTime();if(!this.intervalId)this.intervalId=window.setInterval(this.timerDelegate,this.options.interval)},jumpTo:function(a){this.target= this.state=Math.max(0,Math.min(1,a));this.propagate()},toggle:function(){this.seekTo(1-this.target)},addSubject:function(a){this.subjects[this.subjects.length]=a;return this},clearSubjects:function(){this.subjects=[]},propagate:function(){for(var a=this.options.transition(this.state),b=0;b<this.subjects.length;b++)if(this.subjects[b].setState)this.subjects[b].setState(a);else this.subjects[b](a)},onTimerEvent:function(){var a=(new Date).getTime(),b=a-this.lastTime;this.lastTime=a;a=b/this.options.duration* (this.state<this.target?1:-1);Math.abs(a)>=Math.abs(this.state-this.target)?this.state=this.target:this.state+=a;try{this.propagate()}finally{this.options.onStep.call(this),this.target==this.state&&this.stop()}},stop:function(){if(this.intervalId)window.clearInterval(this.intervalId),this.intervalId=null,this.options.onComplete.call(this)},play:function(){this.seekFromTo(0,1)},reverse:function(){this.seekFromTo(1,0)},inspect:function(){for(var a="#<Animator:\n",b=0;b<this.subjects.length;b++)a+=this.subjects[b].inspect(); a+=">";return a}};Animator.applyDefaults=function(a,b){var b=b||{},c,d={};for(c in a)d[c]=b[c]!==void 0?b[c]:a[c];return d};Animator.makeArrayOfElements=function(a){if(a==null)return[];if("string"==typeof a)return[document.getElementById(a)];if(!a.length)return[a];for(var b=[],c=0;c<a.length;c++)b[c]="string"==typeof a[c]?document.getElementById(a[c]):a[c];return b}; Animator.camelize=function(a){var b=a.split("-");if(b.length==1)return b[0];for(var a=a.indexOf("-")==0?b[0].charAt(0).toUpperCase()+b[0].substring(1):b[0],c=1,d=b.length;c<d;c++){var e=b[c];a+=e.charAt(0).toUpperCase()+e.substring(1)}return a};Animator.apply=function(a,b,c){if(b instanceof Array)return(new Animator(c)).addSubject(new CSSStyleSubject(a,b[0],b[1]));return(new Animator(c)).addSubject(new CSSStyleSubject(a,b))};Animator.makeEaseIn=function(a){return function(b){return Math.pow(b,a*2)}}; Animator.makeEaseOut=function(a){return function(b){return 1-Math.pow(1-b,a*2)}};Animator.makeElastic=function(a){return function(b){b=Animator.tx.easeInOut(b);return(1-Math.cos(b*Math.PI*a))*(1-b)+b}};Animator.makeADSR=function(a,b,c,d){d==null&&(d=0.5);return function(e){if(e<a)return e/a;if(e<b)return 1-(e-a)/(b-a)*(1-d);if(e<c)return d;return d*(1-(e-c)/(1-c))}};Animator.makeBounce=function(a){var b=Animator.makeElastic(a);return function(a){a=b(a);return a<=1?a:2-a}}; Animator.tx={easeInOut:function(a){return-Math.cos(a*Math.PI)/2+0.5},linear:function(a){return a},easeIn:Animator.makeEaseIn(1.5),easeOut:Animator.makeEaseOut(1.5),strongEaseIn:Animator.makeEaseIn(2.5),strongEaseOut:Animator.makeEaseOut(2.5),elastic:Animator.makeElastic(1),veryElastic:Animator.makeElastic(3),bouncy:Animator.makeBounce(1),veryBouncy:Animator.makeBounce(3)}; function NumericalStyleSubject(a,b,c,d,e){this.els=Animator.makeArrayOfElements(a);this.property=b=="opacity"&&window.ActiveXObject?"filter":Animator.camelize(b);this.from=parseFloat(c);this.to=parseFloat(d);this.units=e!=null?e:"px"} NumericalStyleSubject.prototype={setState:function(a){for(var a=this.getStyle(a),b=0,c=0;c<this.els.length;c++){try{this.els[c].style[this.property]=a}catch(d){if(this.property!="fontWeight")throw d;}if(b++>20)break}},getStyle:function(a){a=this.from+(this.to-this.from)*a;if(this.property=="filter")return"alpha(opacity="+Math.round(a*100)+")";if(this.property=="opacity")return a;return Math.round(a)+this.units},inspect:function(){return"\t"+this.property+"("+this.from+this.units+" to "+this.to+this.units+ ")\n"}};function ColorStyleSubject(a,b,c,d){this.els=Animator.makeArrayOfElements(a);this.property=Animator.camelize(b);this.to=this.expandColor(d);this.from=this.expandColor(c);this.origFrom=c;this.origTo=d} ColorStyleSubject.prototype={expandColor:function(a){var b,c;if(b=ColorStyleSubject.parseColor(a))return a=parseInt(b.slice(1,3),16),c=parseInt(b.slice(3,5),16),b=parseInt(b.slice(5,7),16),[a,c,b];window.ANIMATOR_DEBUG&&alert("Invalid colour: '"+a+"'")},getValueForState:function(a,b){return Math.round(this.from[a]+(this.to[a]-this.from[a])*b)},setState:function(a){for(var a="#"+ColorStyleSubject.toColorPart(this.getValueForState(0,a))+ColorStyleSubject.toColorPart(this.getValueForState(1,a))+ColorStyleSubject.toColorPart(this.getValueForState(2, a)),b=0;b<this.els.length;b++)this.els[b].style[this.property]=a},inspect:function(){return"\t"+this.property+"("+this.origFrom+" to "+this.origTo+")\n"}}; ColorStyleSubject.parseColor=function(a){var b="#",c;if(c=ColorStyleSubject.parseColor.rgbRe.exec(a)){for(var d=1;d<=3;d++)a=Math.max(0,Math.min(255,parseInt(c[d]))),b+=ColorStyleSubject.toColorPart(a);return b}if(c=ColorStyleSubject.parseColor.hexRe.exec(a)){if(c[1].length==3){for(d=0;d<3;d++)b+=c[1].charAt(d)+c[1].charAt(d);return b}return"#"+c[1]}return!1};ColorStyleSubject.toColorPart=function(a){a>255&&(a=255);var b=a.toString(16);if(a<16)return"0"+b;return b}; ColorStyleSubject.parseColor.rgbRe=/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;ColorStyleSubject.parseColor.hexRe=/^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;function DiscreteStyleSubject(a,b,c,d,e){this.els=Animator.makeArrayOfElements(a);this.property=Animator.camelize(b);this.from=c;this.to=d;this.threshold=e||0.5} DiscreteStyleSubject.prototype={setState:function(a){for(var b=0;b<this.els.length;b++)this.els[b].style[this.property]=a<=this.threshold?this.from:this.to},inspect:function(){return"\t"+this.property+"("+this.from+" to "+this.to+" @ "+this.threshold+")\n"}}; function CSSStyleSubject(a,b,c){a=Animator.makeArrayOfElements(a);this.subjects=[];if(a.length!=0){var d;if(c)b=this.parseStyle(b,a[0]),c=this.parseStyle(c,a[0]);else for(d in c=this.parseStyle(b,a[0]),b={},c)b[d]=CSSStyleSubject.getStyle(a[0],d);for(d in b)b[d]==c[d]&&(delete b[d],delete c[d]);var e,f,h,j;for(d in b){var i=String(b[d]),g=String(c[d]);if(c[d]==null)window.ANIMATOR_DEBUG&&alert("No to style provided for '"+d+'"');else{if(h=ColorStyleSubject.parseColor(i))j=ColorStyleSubject.parseColor(g), f=ColorStyleSubject;else if(i.match(CSSStyleSubject.numericalRe)&&g.match(CSSStyleSubject.numericalRe))h=parseFloat(i),j=parseFloat(g),f=NumericalStyleSubject,e=CSSStyleSubject.numericalRe.exec(i),g=CSSStyleSubject.numericalRe.exec(g),e=e[1]!=null?e[1]:g[1]!=null?g[1]:g;else if(i.match(CSSStyleSubject.discreteRe)&&g.match(CSSStyleSubject.discreteRe))h=i,j=g,f=DiscreteStyleSubject,e=0;else{window.ANIMATOR_DEBUG&&alert("Unrecognised format for value of "+d+": '"+b[d]+"'");continue}this.subjects[this.subjects.length]= new f(a,d,h,j,e)}}}} CSSStyleSubject.prototype={parseStyle:function(a,b){var c={};if(a.indexOf(":")!=-1)for(var d=a.split(";"),e=0;e<d.length;e++){var f=CSSStyleSubject.ruleRe.exec(d[e]);f&&(c[f[1]]=f[2])}else{var h;h=b.className;b.className=a;for(e=0;e<CSSStyleSubject.cssProperties.length;e++)d=CSSStyleSubject.cssProperties[e],f=CSSStyleSubject.getStyle(b,d),f!=null&&(c[d]=f);b.className=h}return c},setState:function(a){for(var b=0;b<this.subjects.length;b++)this.subjects[b].setState(a)},inspect:function(){for(var a="", b=0;b<this.subjects.length;b++)a+=this.subjects[b].inspect();return a}};CSSStyleSubject.getStyle=function(a,b){var c;if(document.defaultView&&document.defaultView.getComputedStyle&&(c=document.defaultView.getComputedStyle(a,"").getPropertyValue(b)))return c;b=Animator.camelize(b);a.currentStyle&&(c=a.currentStyle[b]);return c||a.style[b]};CSSStyleSubject.ruleRe=/^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/;CSSStyleSubject.numericalRe=/^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;CSSStyleSubject.discreteRe=/^\w+$/; CSSStyleSubject.cssProperties=["azimuth","background","background-attachment","background-color","background-image","background-position","background-repeat","border-collapse","border-color","border-spacing","border-style","border-top","border-top-color","border-right-color","border-bottom-color","border-left-color","border-top-style","border-right-style","border-bottom-style","border-left-style","border-top-width","border-right-width","border-bottom-width","border-left-width","border-width","bottom", "clear","clip","color","content","cursor","direction","display","elevation","empty-cells","css-float","font","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","height","left","letter-spacing","line-height","list-style","list-style-image","list-style-position","list-style-type","margin","margin-top","margin-right","margin-bottom","margin-left","max-height","max-width","min-height","min-width","orphans","outline","outline-color","outline-style","outline-width", "overflow","padding","padding-top","padding-right","padding-bottom","padding-left","pause","position","right","size","table-layout","text-align","text-decoration","text-indent","text-shadow","text-transform","top","vertical-align","visibility","white-space","width","word-spacing","z-index","opacity","outline-offset","overflow-x","overflow-y"]; function AnimatorChain(a,b){this.animators=a;this.setOptions(b);for(var c=0;c<this.animators.length;c++)this.listenTo(this.animators[c]);this.forwards=!1;this.current=0} AnimatorChain.prototype={setOptions:function(a){this.options=Animator.applyDefaults({resetOnPlay:!0},a)},play:function(){this.forwards=!0;this.current=-1;if(this.options.resetOnPlay)for(var a=0;a<this.animators.length;a++)this.animators[a].jumpTo(0);this.advance()},reverse:function(){this.forwards=!1;this.current=this.animators.length;if(this.options.resetOnPlay)for(var a=0;a<this.animators.length;a++)this.animators[a].jumpTo(1);this.advance()},toggle:function(){this.forwards?this.seekTo(0):this.seekTo(1)}, listenTo:function(a){var b=a.options.onComplete,c=this;a.options.onComplete=function(){b&&b.call(a);c.advance()}},advance:function(){this.forwards?this.animators[this.current+1]!=null&&(this.current++,this.animators[this.current].play()):this.animators[this.current-1]!=null&&(this.current--,this.animators[this.current].reverse())},seekTo:function(a){a<=0?(this.forwards=!1,this.animators[this.current].seekTo(0)):(this.forwards=!0,this.animators[this.current].seekTo(1))}};
          //JQuery plugin which provides rankingTableUpdate function to animate the update of a table.
      //Note: Requires JQuery 1.4.3 and
      //		"Bernie's Better Animation" library (http://berniesumption.com/software/files/2010/09/animator.zip)
      //
      //Author: Mark Rhodes
      //Version: 1.0
      //Company: ScottLogic
      //Date: 17th November 2010

      (function($){

        //Defines the 16 standard html colours by they hash codes - if you use others then
        //don't complain when it doesn't work!
        var standardColorNames = {
          aqua: '#00FFFF',
          black: '#000000',
          blue: '#0000FF',
          fuchsia: '#FF00FF',
          gray: '#808080',
          grey: '#808080',
          lime: '#00FF00',
          maroon: '#800000',
          navy: '#000080',
          olive: '#808000',
          purple: '#800080',
          red: '#FF0000',
          silver: '#C0C0C0',
          teal: '#008080',
          white: '#FFFFFF',
          yellow: '#FFFF00'
        };

        //Simple non-infallable function to obtain the background color of an element.
        //Assumes that the element and parents are statically positioned, not absolute etc.
        //and works by checking the computed style of an element, if this is transparent
        //recursively looks at colour of the parent node, if no colour is found uses white.
        //Also considers all rgba values to be transparent, so don't use them..
        var getColourOfBackground = function(ele){
          var colorStr = $(ele).css("backgroundColor");
          if(colorStr.indexOf('rgba') === 0 || colorStr === 'transparent'){  //works for 'rgba(0,0,0,0)' in Chrome, Safari and 'transparent' for IE, FF, Opera
            return (ele.parentNode != document) ? getColourOfBackground(ele.parentNode) : '#FFFFFF';
          }
          if(colorStr in standardColorNames){
            colorStr = standardColorNames[colorStr];
          } else if(colorStr.indexOf('#') == -1){ //in case it's already a hex color (occurs in IE).
            colorStr = cssColorToHex(colorStr);
          }
          return colorStr;
        }

        //Convert the rgb value to the hex equivilent..
        var cssColorToHex = function(colorStr){
          var hex = '#';
          $.each(colorStr.substring(4).split(','), function(i, str){
            var h = ($.trim(str.replace(')',''))*1).toString(16);
            hex += (h.length == 1) ? "0" + h : h;
          });
          return hex;
        };

        var getMinLeftValueInOptions = function(options){
          var minLeft = 0;
          $.each(options.animationSettings, function(part, settings){
            minLeft = Math.min(settings.left, minLeft); 
          });
          return minLeft;
        }

        //The defalt options to use in the case that none as specified..
        var defaultOptions = {
          onComplete: function(){ /*do nothing*/ },
          duration: [1000, 0, 700, 0, 500], //The milliseconds to do each phase and the deplay between them
          extractIdFromCell: function(td){ return $.trim($(td).html()); }, //the function to use to extract the id value from a cell in the id column.
          animationSettings: {
            up: {
              left: -25, // Move left
              backgroundColor: '#004400' // Dullish green
            },
            down: {
              left: 25, // Move right
              backgroundColor: '#550000' // Dullish red
            },
            fresh: {
              left: 0, //Stay put in first stage.
              backgroundColor: '#FFFF33' // Yellow
            },
            drop: {
              left: 0, //Stay put in first stage.
              backgroundColor: '#550055' // Purple
            }
          }
        };

        //given a cell it removes the padding from it and returns what it was as a string.
        var removeAndReturnPadding = function(td){
          td = $(td);
          var cellPadding = td.css("padding-top") + " " +  td.css("padding-right") + " " + td.css("padding-bottom") + " " +  td.css("padding-left");
          td.css({padding : 0});
          return cellPadding;
        };

        //should be given the options passed in from the command-line and
        //fills in any missing parameters with default values.
        var completeOptions = function(options){
          if(!options){
            options = {};
          }
          //Allow some parameters to be given as single values that can be converted to what the
          //rankingTableUpdate function expects..
          if(typeof options.duration ===  'number'){
            var overThree =  options.duration/3;
            //set each phase to take a third of the time with no delay between them..
            options.duration = [overThree, 0, overThree, 0, overThree];
          }

          //set any unset parameters to the default values..
          return $.extend(true, {}, defaultOptions, options);
        }

        //Replaces the first element is "this" jQuery object, which should be an HTML table,
        //with the given new version and animates the changes based on the given options.
        //
        //params:
        //	newTable - an HTML table element or jQuery object in which the first element is
        //             an HTML table
        //  options - a JS object which defines how the animation should operate.
        $.fn.rankingTableUpdate = function(newTable, options){
          //make sure we have jQuery wrapped versions of both tables..
          var jOrigTable = this, jNewTable = $(newTable);

          //store a reference to the actual tables that will be updated..
          var origTable = this[0];
          newTable = jNewTable[0];

          //we need the new table to be hidden and have the same parent as the orig table,
          //so we can measure it and get colour values from it accurately..
          jNewTable.hide();
          var jOrigTableParent = jOrigTable.parent();
          if(jNewTable.parent()[0] !== jOrigTableParent[0]){
            jOrigTableParent.append(newTable);
          }

          //fills in any blank options will default values so as to simplify this function's code..
          options = completeOptions(options);

          //store references to the tbodies and "cache" some values..
          var origTBody = origTable.tBodies[0];
          var newTBody = newTable.tBodies[0];
          var rowsInNewTable = newTBody.rows.length; //cache this as it's slow in IE.
          var columnsInEachRow = origTable.tHead.rows[0].cells.length;
          var colourBehindTable = getColourOfBackground(origTable.parentNode);

          //both tables should have the same columns, we need to examine
          //these and figure out which columns need to be updated..
          //columns should have class either anim:position, anim:constant, anim:id, or anim:update.
          var idColumn = 0, positionColumn = -1; constantColumns = {}, updatingColumns = {}, noUpdatingColumns = true;
          $(origTable.tHead.rows[0].cells).each(function(i, td){
            td = $(td);
            if(td.hasClass("anim:position")){ 
              positionColumn = i;
              updatingColumns[i] = true;
            } else if(td.hasClass("anim:id")){
              idColumn = i;
              constantColumns[i] = true;
            } else if(td.hasClass("anim:constant")){
              constantColumns[i] = true;
            } else {  //by default treat as an updating column..
              updatingColumns[i] = true;
              noUpdatingColumns = false;
            }
          });

          //associate the value of the id column for the table with the row in which is appears..
          var origTableIdsToRows = {}, newTableIdsToRows = {};
          $(origTBody.rows).each(function(row, tr){ 
            origTableIdsToRows[options.extractIdFromCell(tr.cells[idColumn])] = row;
          });
          $(newTBody.rows).each(function(row, tr){ 
            newTableIdsToRows[options.extractIdFromCell(tr.cells[idColumn])] = row;
          });

          //break the id's in five sets - up, down, fresh, drop, stayPut
          var up = {}, down = {}, fresh = {}, drop = {}, stayPut = {};
          var maxRowsUp = 0, maxRowsDown = 0, numRowsStaying = 0;
          $.each(origTableIdsToRows, function(id, oldRow){
            //case that a the row needs to be moved..
            if(id in newTableIdsToRows){
              var newRow = newTableIdsToRows[id];
              var diff = oldRow - newRow;
              if(diff > 0){
                up[oldRow] = newRow;
                maxRowsUp = Math.max(diff, maxRowsUp);
              } else if(diff < 0){
                down[oldRow] = newRow;
                maxRowsDown = Math.max(0-maxRowsDown, maxRowsDown)
              } else {
                stayPut[oldRow] = true;
                numRowsStaying++;
              }
              delete newTableIdsToRows[id];
            } else {
              drop[oldRow] = true;
            }
          });
          //elements left in the new table must be new ones..
          $.each(newTableIdsToRows, function(id, newRow){
            //need to make the new unique from anything in the other objects..
            fresh['x'+newRow] = true;
          });

          //don't bother doing anything if all rows are staying put and no columns are updating..
          if(numRowsStaying === rowsInNewTable && noUpdatingColumns){
            //wait a little while then do it (in case program is expecting it to take sometime..
            setTimeout(function(){
              //perform the actual swap
              jOrigTable.replaceWith(jNewTable);
              jNewTable.show();

              //run the onComplete callback function..
              options.onComplete();
            }, 10); 
            return;
          }

          //--- Animation setup ------

          //we need to store the heights of the tables so that we can animate any differences between them..
          var origHeight = jOrigTable.height();
          var newHeight = jNewTable.height();
          var minLeftValue = getMinLeftValueInOptions(options);

          //we first wrap the table in a wrapper div that will hide any extra rows we add to it
          //A bit of trickery is required here, to move the table to the right the first, then move
          //the wrapper to the left the same amount, this is because setting overflow: hidden or (even just
          //for overflow-y: hidden!) prevents an inner element extending the left hand side of the container.
          jOrigTable.css({position: "relative", left: 0-minLeftValue });
          jOrigTable.wrap(
            $("<div />", {
              css: {
                height: origHeight,
                overflow: "hidden",
                position: "relative",
                left: minLeftValue
              }
            })
          );

          //wrap table cell contents with a div..
          $(origTBody.rows).each(function(row, tr){
            $.each(tr.cells, function(column, td){
              var wrapper = $('<div/>', {
                'class' : 'moveable',
                css: {
                  position: "relative",
                  padding: removeAndReturnPadding(td)
                }
              });
              wrapper.data("row", row);
              wrapper.data("column", column);
              $(td).wrapInner(wrapper);
            });
          });

          var rowDiff = rowsInNewTable - origTBody.rows.length;
          //we'll attach empty extra rows to the end of the table which will be used to hold
          //data latter and will stop fresh rows at the bottom from showing up.
          if(rowDiff > 0){
            var emptyRow = $('<tr/>');
            //put something in first cell to ensure height is ok.
            emptyRow.append($('<td/>', {
              css: {
                color: colourBehindTable,
                backgroundColor: colourBehindTable
              }
            }).html('a'));
            for(var i = 1; i < columnsInEachRow; i++){
              emptyRow.append($('<td/>', {
                css: {
                  backgroundColor: colourBehindTable
                }
              }));
            }
            jOrigTable.append(emptyRow);

            while(rowDiff > 0){
              //append a clone so that there is an extra empty row in the table..
              var emptyClone = emptyRow.clone();
              jOrigTable.append(emptyClone);
              rowDiff--;
            }
          }

          //Now do the same for the fresh rows, for these we'll:
          //  1. Clone the row in the new table.
          //  2. Attach the clone to the end of the original table
          //  3. Wrap the cells with divs like above
          $.each(fresh, function(row){
            //the row which the fresh row will move to..
            row = row.substring(1)*1;
            var clone = $(newTBody.rows[row]).clone();
            jOrigTable.append(clone);
            $(clone[0].cells).each(function(column, td){
              var wrapper = $('<div />', {
                'class' : 'moveable',
                css: {
                  position: "relative",
                  padding: removeAndReturnPadding(td),
                  backgroundColor: options.animationSettings.fresh.backgroundColor,
                  left: options.animationSettings.fresh.left
                }
              });
              //need to make the row unique so that it doesn't clash..
              wrapper.data("row", 'x'+row);
              wrapper.data("column", column);
              $(td).wrapInner(wrapper);
            });
          });

          //Set up a simple animator chain as the AnimatorChain in animator.js seems to be buggy..

          //The third animator should set the table to the state of the new table, this involves showing
          //the new values, shrinking the table if required and pushing the rows left/right so they
          //are back in the table.
          //When it's finished it should perform the switch between the tables.
          var thirdAnimator = new Animator({
            //when it's finished update the table as expected and tidy up..
            onComplete: function(){
              //perform the actual swap (note we replace parentNode which is the table wrapper)..
              $(origTable.parentNode).replaceWith(jNewTable);
              jNewTable.show();

              //run the onComplete callback function..
              options.onComplete();
            },
            duration: options.duration[4]
          });

          //In the second phase the rows should be moved verically to their required positions.
          var secondAnimator = new Animator({
            onComplete: function(){
              //play final phase animation after specified delay..
              setTimeout(function(){
                thirdAnimator.play();
              }, options.duration[3]);
            },
            duration: options.duration[2]
          });

          //In the intial stage of the animation the updating values should be hidden, the rows coloured
          //and pulled to the left/right as expected and the table extended to accommodate new rows.
          //When complete the values which were hidden are altered to their new ones.
          var updateValue = [];  	//the divs with the values we'll change to the new values.
          var firstAnimator = new Animator({
            onComplete: function(){
              //Update values should contain pairs, the dom element to update and the new
              //value to use, which is a string which may encode dom elements if required..
              $.each(updateValue, function(i, elemAndValue){
                $(elemAndValue[0]).html(elemAndValue[1]);
              });

              //play the second animation after specified delay..
              setTimeout(function(){
                secondAnimator.play()
              }, options.duration[1]);
            },
            duration: options.duration[0]
          });

          //if we need to make the table bigger do this at the start of the animation..
          if(origHeight < newHeight){
            firstAnimator.addSubject(new NumericalStyleSubject(origTable.parentNode, "height", origHeight, newHeight));

          } else if(origHeight > newHeight) { //if the table needs to shrink, do this at the end.
            thirdAnimator.addSubject(new NumericalStyleSubject(origTable.parentNode, "height", origHeight, newHeight));
          }

          jOrigTable.find('div.moveable').each(function(i, wrapper){

            var newCell; //this will be set to the cell in the new table which is equivilent to the one being
                  //wrapped, this will be remain null for wrappers in fresh and dropped rows.
            var oldCell = wrapper.parentNode;
            var row = $(wrapper).data("row");
            var column = $(wrapper).data("column");

            //need to fix the colour so that it really looks like the rows are moving out of place..
            if(!(row in stayPut) && !(row in fresh)){
              var initialBGColor = getColourOfBackground(oldCell);
              $(wrapper).css('backgroundColor', initialBGColor);
              $(wrapper.parentNode).css('backgroundColor', colourBehindTable);
            }

            if(row in up){
              var animationSetting = options.animationSettings.up;
              var rowsUp = row-up[row];

              var animateToBGColor = animationSetting.backgroundColor;
              var animateLeft = animationSetting.left;
              newCell = newTBody.rows[up[row]].cells[column];

              //move it left/right and change the background color..
              firstAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", 0, animateLeft));
              firstAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", initialBGColor, animateToBGColor)); 

              //move the row up..
              var topDiff =  $(origTBody.rows[up[row]]).position().top - $(origTBody.rows[row]).position().top;
              secondAnimator.addSubject(new NumericalStyleSubject(wrapper, "top", 0, topDiff));

              //move it back into position and colour the background to the new cell's colour..
              thirdAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", animateLeft, 0));
              thirdAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", animateToBGColor, getColourOfBackground(newCell))); 

            } else if(row in down){
              var animationSetting = options.animationSettings.down;
              var rowsDown = down[row]-row;

              var animateToBGColor = animationSetting.backgroundColor;
              var animateLeft = animationSetting.left;
              newCell = newTBody.rows[down[row]].cells[column];

              //move it left/right and change the background color..
              firstAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", 0, animateLeft));
              firstAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", initialBGColor, animateToBGColor));
              $(wrapper.parentNode).css('backgroundColor', colourBehindTable);

              //move the row down..
              var topDiff = $(origTBody.rows[down[row]]).position().top - $(origTBody.rows[row]).position().top;
              secondAnimator.addSubject(new NumericalStyleSubject(wrapper, "top", 0, topDiff));

              //move it back into position and colour the background to the new cell's colour..
              thirdAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", animateLeft, 0));
              thirdAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", animateToBGColor, getColourOfBackground(newCell)));

            }  else if(row in drop){
              var animationSetting = options.animationSettings.drop;

              var animateToBGColor = animationSetting.backgroundColor;
              var animateLeft = animationSetting.left;
              $(wrapper.parentNode).css('backgroundColor', colourBehindTable);

              //move it left/right and change the background color..
              firstAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", 0, animateLeft));
              firstAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", initialBGColor, animateToBGColor));

              //move it to the bottom of the table, where it'll be hidden and fade it away.
              var topDiff = newHeight-$(origTBody.rows[row]).position().top;
              secondAnimator.addSubject(new NumericalStyleSubject(wrapper, "top", 0, topDiff));
              secondAnimator.addSubject(new NumericalStyleSubject(wrapper, "opacity", 1, 0, ""));

            } else if(row in fresh){
              //turn row into a number and lose the preceeding 'x'..
              row = row.substring(1)*1;

              var animationSetting = options.animationSettings.fresh;
              newCell = newTBody.rows[row].cells[column];

              //move the row up..
              var topDiff = $(origTBody.rows[row]).position().top - $(wrapper.parentNode).position().top;
              secondAnimator.addSubject(new NumericalStyleSubject(wrapper, "top", 0, topDiff));						

              //move it back into position and colour the background to the new cell's colour..
              thirdAnimator.addSubject(new ColorStyleSubject(wrapper, "background-color", animationSetting.backgroundColor, getColourOfBackground(newCell)));
              thirdAnimator.addSubject(new NumericalStyleSubject(wrapper, "left", animationSetting.left, 0));

            } else {  //must be in stay put..
              newCell = newTBody.rows[row].cells[column];
            }

            //in this case we may need to animate the updating of the value..
            if(column in updatingColumns && (column != positionColumn || !(row in stayPut))){

              //need to inner wrapper which will allow content of cell to be removed..
              $(wrapper).wrapInner($('<div />', {'class': 'innerWrapper'}));
              var innerWrapper =  $(wrapper).find(".innerWrapper")[0]; //note: this seems like excessive work but there
                                          //seems to be a bug with jQuery requiring it to be like this!
              firstAnimator.addSubject(new NumericalStyleSubject(innerWrapper, "opacity", 1, 0, ""));
              if(newCell != null){
                thirdAnimator.addSubject(new NumericalStyleSubject(innerWrapper, "opacity", 0, 1, ""));
                updateValue.push([innerWrapper, $(newCell).html()]);
              }
            }
          });

          //trigger the animation..
          firstAnimator.play();

          //make it chainable..
          return this;
        }

      })(jQuery);
