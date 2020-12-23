
    /* NUMERATOR */
    (function(factory){'use strict';if(typeof define==='function'&&define.amd){define(['jquery'],factory)}else if(typeof exports==='object'){factory(require('jquery'))}else{if(typeof jQuery==='undefined'){throw 'jquery-numerator requires jQuery to be loaded first'}
    factory(jQuery)}}(function($){var pluginName="numerator",defaults={easing:'swing',duration:500,delimiter:null,rounding:0,toValue:undefined,fromValue:undefined,queue:!1,onStart:function(){},onStep:function(){},onProgress:function(){},onComplete:function(){}};function Plugin(element,options){this.element=element;this.settings=$.extend({},defaults,options);this._defaults=defaults;this._name=pluginName;this.init()}
    Plugin.prototype={init:function(){this.parseElement();this.setValue()},parseElement:function(){var elText=$.trim($(this.element).text());this.settings.fromValue=this.settings.fromValue||this.format(elText)},setValue:function(){var self=this;$({value:self.settings.fromValue}).animate({value:self.settings.toValue},{duration:parseInt(self.settings.duration,10),easing:self.settings.easing,start:self.settings.onStart,step:function(now,fx){$(self.element).text(self.format(now));self.settings.onStep(now,fx)},progress:self.settings.onProgress,complete:self.settings.onComplete})},format:function(value){var self=this;if(parseInt(this.settings.rounding)<1){value=parseInt(value,10)}else{value=parseFloat(value).toFixed(parseInt(this.settings.rounding))}
    if(self.settings.delimiter){return this.delimit(value)}else{return value}},delimit:function(value){var self=this;value=value.toString();if(self.settings.rounding&&parseInt(self.settings.rounding,10)>0){var decimals=value.substring((value.length-(self.settings.rounding+1)),value.length),wholeValue=value.substring(0,(value.length-(self.settings.rounding+1)));return self.addDelimiter(wholeValue)+decimals}else{return self.addDelimiter(value)}},addDelimiter:function(value){return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g,this.settings.delimiter)}};$.fn[pluginName]=function(options){return this.each(function(){if($.data(this,"plugin_"+pluginName)){$.data(this,'plugin_'+pluginName,null)}
    $.data(this,"plugin_"+pluginName,new Plugin(this,options))})}}))
    
    $(document).ready(function(){
        updateBgCanvas('0',{})
})
/* BG SHOP */

var payload = {}
$(".bg-clickable").on("click", ".plx-bg-card", function () {
    $("#price-RBN").html($(this).data('price'))
    $("#bg-title").html($(this).data('name'))
    $("#bg-code").html($(this).data('code'))
    $("#bg-artist").html($(this).data('artist'))
    $("#artistPic").attr("src", GRIMOIRE.artistPics[$(this).data('artist')])

    if ($(this).data('atlink')) {
        $("#bg-artist").attr("href", $(this).data('atlink'))
        $("#bg-artist").append("<span class='ext-link-icon'>")    }

    if(!$(this).data('artist')){
        $("#bg-artist").html("Unknown");
        $("#bg-artist").attr("href", "")
        $("#artistPic").attr("src", "")
    }

    $("#bg-image").attr("src", "/backdrops/" + $(this).data('code') + ".png")
    $("#bg-rarity").attr("src", "/images/tiers/new/" + $(this).data('rarity') + ".png")
})

$(".bg-clickable").on("click", "a.plx-pg-nav", function () {
    updateBgCanvas($(this).data("link"), payload);
});

$('form').submit(function () {
    $("#search").addClass('is-loading')
    query = $(".plx-pagination .plx-active a").data('link')
    payload = {
        filter: this.filter.value,
        event: this.event.checked,
        rarity: this.rarity.selectedOptions[0].dataset.id,
        sort: "newest"
    }
    updateBgCanvas(0, payload);
    return false;
});

function updateBgCanvas(query, options) {
    let dockHeight = $("#bg-dock").height()

    $.post('/search/bgs/' + query, {        
            piece: 'shop/bgshop/list',
            options
    }, data => {
        $("#bg-dock").height(dockHeight)
        $('#bg-dock').html(data)
        $("#bg-dock").height('auto')
        $("#search").removeClass('is-loading')
    })
}



function checkUpdates() {
    var xhr = new XMLHttpRequest();
    var user = userinfo.id
    if (!user) return;

    xhr.open('GET', "https://pollux.fun/api/user/" + user);
    xhr.onload = function () {
        let data = JSON.parse(xhr.response);
        $(".plx-tracker-rubines").numerator({
            toValue: data.RBN
        })
        $(".plx-tracker-jades").numerator({
            toValue: data.JDE
        })
        $(".plx-tracker-sapphires").numerator({
            toValue: data.SPH
        })
    };
    xhr.send();
}

setInterval(function () {
    if (document.hasFocus()) {
        checkUpdates();
    }
}, 2000)
