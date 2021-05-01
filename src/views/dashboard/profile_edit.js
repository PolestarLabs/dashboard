var TIMER = null;
var DASH;


var img = new Image();

VueSelect.VueSelect.methods.maybeAdjustScroll = () => false;



var Chrome = window.VueColor.Chrome;

if (!userdata.modules.flairsInventory.includes("default"))
  userdata.modules.flairsInventory.push("default");
const flairsAvailable = userdata.modules.flairsInventory;

var CANVAS, ctx;


 DASH = new Vue({
  el: "#dash",
  data:  {
      userIsPremium: isPremium(),
      RSHP: {loading:true},
      featuredMarriage: userdata.featuredMarriage,
      message: "hello",
      favcolor: {
        hex: userdata.modules.favcolor,
        source: "hex",
      },
      window:{width:0,height:0},
      isColorpickerOpen: false,
      isFlairOpen: false,
      rars: ["C", "U", "R", "SR", "UR"],
      selectBackground: 'LOADING...',
      selectSticker:'LOADING...',
      selectBooster: 'LOADING...',       
      selectFlair: userdata.modules.flairTop,
      flairsAvailable,
      backgroundsAvailable:[],
      stickerAvailable: [],
      boostersAvailable: [],
      Swal,
      search: "",
      select: "",
      tagline: userdata.modules.tagline,
      persotext: userdata.modules.persotext,
      frame: (userdata.switches || {}).profileFrame,
      medals: [],
      favcolorOptions: [],
      frameOpacity:1,
      medalsEquipped: [],
      customBgUpload: null,
      hooperSettings: {
        itemsToShow: 5,
        centerMode: true,
        infiniteScroll: true,
        vertical: true,
        transition: 100,
        initialSlide: flairsAvailable.indexOf(userdata.modules.flairTop),
      },
      sortWife: "ring",
      loadedBGimage: "/backdrops/"+userdata.id+".png"
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
},
destroyed() {
    window.removeEventListener('resize', this.handleResize);
},
  components: {
    "chrome-picker": Chrome,
    "v-select": VueSelect.VueSelect,

    Hooper: window.Hooper.Hooper,
    Slide: window.Hooper.Slide,
    HooperPagination: window.Hooper.Pagination,
    HooperNavigation: window.Hooper.Navigation,
  },
  methods: {

    chooseFiles(){
      document.getElementById("file-upload").click()
    },
    setFile(){
      vueDoesntFuckingWork()     
    },
    createNewCustomBg(){
      if(isPremium()){
        fetch(`/api/cosmetics/backgrounds/custom`, {
          method: 'POST',
          headers: {'Content-Type':"application/json;charset=UTF-8"}
        }).then(res=>{
          try{
            res.json().then(x=>{
              console.log(res);
            })
          }catch(e){};
          
          updateUserBGs(1);
        });
      }else{
        console.log("no premium dawg")
      }
    },
    async sendFile() {
      if (!CANVAS) return;
      let userBG = this.backgroundsAvailable.find(b=>b.code === userdata.id);
      
      //let dataForm = new FormData();
      //dataForm.append(`file`, this.$refs.custombgHolder.files[0]);
      
      await fetch(`/api/cosmetics/backgrounds/custom`, {
        method: 'PATCH',
        headers: {'Content-Type':"application/json;charset=UTF-8"},
        body: JSON.stringify({data: CANVAS.toDataURL() }),
      });
      
      setTimeout(_=>{
        userBG.img = userBG.img.split('?v=')[0] + `?v=${Date.now()}`;
        this.selectBackground.code.startsWith(userdata.id) ? this.selectBackground.img = userBG.img.split('?v=')[0] + `?v=${Date.now()}` : null;
        this.onChange(this.selectBackground)
      },1000);      
    },
    
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
  },
    saveAll(){
      AUTOSAVE("all");
    },
    changeFeatMarriage(id) {
      this.featuredMarriage = id;
      AUTOSAVE("Featured Marriage");
      
    },
    toggleWifeOrder(by) {
      if (this.sortWife == by) return this.RSHP.reverse();

      this.sortWife = by;

      if (by == "ring") {
        this.RSHP.sort((x, y) => (x.ring < y.ring ? 1 : -1));
      }
      if (by == "date") {
        this.RSHP.sort((x, y) => x.since - y.since);
      }
      if (by == "lovp") {
        this.RSHP.sort((x, y) => (x.lovepoints || 0) - (y.lovepoints || 0));
      }
    },
    since(x) {
      return moment(x).fromNow(true);
    },
    updateRubines(x) {
      this.RBN = x || userdata.modules.RBN;
    },
    filterMeds() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        var input = this.search;
        var filter = document.getElementById("filter");
        if (input == "") filter.setAttribute("plx-filter-control", "");
        else
          filter.setAttribute(
            "plx-filter-control",
            "filter:[data-search*='" + input + "'i] ; group:search"
          );

        filter.click();
      }, 800);
    },
    filterMedals() {
      let filtered = this.medals;
      if (this.search) {
        filtered = this.medals.filter(
          (m) => m.name.toLowerCase().indexOf(this.search) > -1
        );
      }
      if (this.select) {
        filtered = filtered.filter(
          (m) => m.rarity.toLowerCase() === this.select.toLowerCase()
        );
      }
      console.log(filtered);
      return filtered;
    },
    setFavColor(color){
      this.favcolor.hex = color;
    },
    calculateSuggestionColors(bgID){
      fetch(`/api/cosmetics/backgrounds/${bgID}/colors`).then(r =>
        r.json().then(res =>  this.favcolorOptions = res )
      );
    },
    fuckThis() {
      $("nav.topbar ").css({ background: this.favcolor.hex });
      updateColorName(this.favcolor.hex);
    },
    saveFlair(payload) {
      setTimeout(() => {
        this.selectFlair = flairsAvailable[this.$refs.flairs.currentSlide];
        AUTOSAVE("FLAIR");
      }, 800);
    },
    gotoFlair: function (f) {
      this.$refs.flairs.slideTo(f);
      //if (!this.isFlairOpen) setTimeout(()=>this.$refs.flairs.update(),50);
    },
    toggleColorpick: function () {
      updateColorName(this.favcolor.hex);
      this.isColorpickerOpen = !this.isColorpickerOpen;
      this.favcolor.source = "hex";
      AUTOSAVE("COLOR");
    },
    setSelected: (val) => {
      console.log(val);
    },
    onChangeStickerPack(item) {
      this.selectSticker = "none";
      AUTOSAVE("STICKER-PACK");
    },
    onChangeSticker(item) {
      AUTOSAVE("STICKER");
    },
    onChange(item) {
      this.calculateSuggestionColors(item.code);
      $("#background-bar .name.sel").html(item.name);
      $("#background-bar .bgcode code").html(item.code);
      $(".sidebg").attr("src", "/backdrops/" + item.code + ".png?v="+Date.now());
      $("#background-bar .background-slot, .user-bg").css({
        "background-image": "url('/backdrops/" + item.code + ".png?v="+Date.now()+"')",
      });
      $("#background-bar .background-thumb").css({
        "background-image": "url('/backdrops/" + item.code + ".png?v="+Date.now()+"')",
      });
      AUTOSAVE("BACKGROUND");
    },
    bgFiltering: (opts, srch) =>
      opts.filter((o) => {
        return [o.rarity, o.name, o.tags, o.code]
          .join(" ")
          .toLowerCase()
          .includes(srch.toLowerCase());
      }),
    stkFiltering: (opts, srch) =>
      opts.filter((o) => {
        return [o.rarity, o.name, o.code]
          .join(" ")
          .toLowerCase()
          .includes(srch.toLowerCase());
      }),
    maybeAdjustScroll: () => false,
    medalreset: function medalreset() {
      const allMedals = $(".medal-chip:visible");
      allMedals.prependTo("#inventory");
      seeEquips();
    },
    medalrandom: function medalrandom() {
      const allMedals = $(".medal-chip:visible");
      this.medalreset();
      let slots = $("#equipped .eq-container").children();
      let rand = (res) => res.eq(Math.floor(Math.random() * res.length));
      setTimeout(() => {
        slots.each(function () {
          rand(allMedals).prependTo($(this));
        });
        seeEquips();
      }, 1);
    },
  },
});

function updateColorName(hex) {
  fetch(
    "https://www.thecolorapi.com/id?hex=" + hex.replace("#", "")
  ).then((r) => r.json().then(async (res) => {
    $("#colorname").html(res.name.value)
     //UTOSAVE("COLOR");
  }));
}

var correctCards = 0;
$(function () {
  var lastPlace;
  $("#inventory").sortable({
    connectWith: ".sortable",
  });
  $("#inventory > *").disableSelection();
  $(".drag").draggable({
    connectWith: ".sortable",
    revert: "invalid",
    helper: "clone",
    cursorAt: {
      top: 50,
      left: 50,
    },
    appendTo: "body",
    zIndex: 9,
    start: function (event, ui) {
      $(this).hide();
      lastPlace = $(this).parent();
    },
    stop: function (event, ui) {
      seeEquips();
      $(this).show();
      lastPlace = $(this).parent();
    },
  });
  $("#inventory").droppable({
    connectWith: ".sortable",
    drop: function (event, ui) {
      $(this).removeClass("over");
      $(this).removeClass("dropa");

      $(lastPlace).removeClass("dropt");
      var dropped = ui.draggable;
      var droppedOn = this;
      $(dropped).detach().prependTo($(droppedOn));
      //$(dropped).detach().css({top: 0,left: 0}).prependTo($(droppedOn));
    },
  });

  $(".drop").droppable({
    hoverClass: "slot-hover",
    drop: function (event, ui) {
      let dropped = ui.draggable;
      let droppedOn = this;
      if ($(droppedOn).children().length > 0)
        $(droppedOn).children().detach().prependTo($(lastPlace));
      $(dropped).detach().prependTo($(droppedOn));
    },
  });
});

function seeEquips() {
  var medals = [];
  var slots = $("#equipped .eq-container").children();

  for (i = 0; i < slots.length; i++) {
    try {
      medals.push(slots[i].children[0].dataset.medal);
    } catch (e) {
      medals.push(0);
    }
  }
  unsaved = true;
  DASH.medalsEquipped = medals;
  localStorage.setItem("medals", JSON.stringify(medals));
  AUTOSAVE("MEDALS");
}

$("document").ready(() => setTimeout(() => DASH.$refs.flairs.update(), 1000));

async function AUTOSAVE(what,silent) {
  if(!DASH) return;
//if (!TIMER && what == "FLAIR") return (TIMER = setTimeout(() => {}, 500));
////  if (!TIMER && what == "COLOR") return (TIMER = setTimeout(() => {}, 500));
 // if (TIMER) {
 //   clearTimeout(TIMER);
 //   TIMER = null;
 // }
 if(['COLOR','FLAIR'].includes(what)) silent = true;
  if(!silent) $("#postloader").fadeIn("slow");

//  TIMER = setTimeout(() => {
    let relevantData = {
      flair: DASH.selectFlair,
      ptxt: DASH.persotext,
      tgln: DASH.tagline,
      color: DASH.favcolor.hex,
      bkg: DASH.selectBackground.code,
      medals: DASH.medalsEquipped.map(x=>x.id||x.icon||x||0),
      sticker: DASH.selectSticker.id,
      frame: DASH.frame,
      wife: DASH.featuredMarriage || "",
    };

    let queue = [];
    let ALL = what === "all";
    if (ALL || what === "MEDALS") {
      queue.push(
        (async () => {
          if (relevantData.medals !== []) {
            return fetch("/dashboard/profile/medals", {
              method: "PUT",
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify(relevantData.medals),
            });
          }
        })()
      );
    }
    if (ALL || what === "TAGLINE") {
      queue.push(
        fetch("/dashboard/profile/tagline", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.tgln }),
        })
      );
    }
    if (ALL || what === "PTXT") {
      queue.push(
        fetch("/dashboard/profile/personaltxt", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.ptxt }),
        })
      );
    }

    if (ALL || what === "COLOR") {
      queue.push(
        fetch("/dashboard/profile/color", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.color }),
        })
      );
    }

    if (ALL || what === "STICKER" || what === "STICKER-PACK") {
      queue.push(
        fetch("/dashboard/profile/sticker", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.sticker }),
        })
      );
    }
    if (ALL || what === "BACKGROUND") {
      queue.push(
        fetch("/dashboard/profile/background-legacy", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            data: relevantData.bkg,
          }),
        })
      );
    }

    if (ALL || what === "Featured Marriage") {
      queue.push(
        fetch("/dashboard/profile/wife", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.wife }),
        })
      );
    }
    if (ALL || what === "FLAIR") {
      queue.push(
        fetch("/dashboard/profile/flair", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.flair }),
        })
      );
    }
    if (ALL || what === "FRAME") {
      queue.push(
        fetch("/dashboard/profile/frame", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ data: relevantData.frame }),
        })
      );
    }

    if (!queue.length) return;
    Promise.all(queue).then((res) => silent?null:processRes(res, what, "Profile Updated!"));


    DASH.$refs.flairs.update();
    console.log(
      `%c[${what}]` + " %cSAVED!",
      "background: #222; color: #bada55",
      "background: none; color: unset"
    );
    console.log(relevantData);
 // }, 1200);
}


fetch("/api/relationships?uid="+userinfo.id).then(r =>
  r.json().then(res =>  DASH.RSHP = res.map(rel=> {rel.wife = rel.usersData.find(w=>w.id!=userdata.id); delete rel.usersData; return rel} )||[]  )
);

fetch("/api/items/search?type=boosterpack&all=1").then((r) =>
  r.json().then((res) => {
    DASH.boostersAvailable = res.map((pack) => {
      pack.size = res.filter((s) => s.series_id == pack.icon).length;
      return pack;
    });
    DASH.boostersAvailable = res;
    console.log({bav:DASH.boostersAvailable})
    fetch("/api/user/" + userinfo.id + "/stickers").then(
      (r) =>
        r.json().then((res2) => {
          console.log({res2})
          DASH.calculateSuggestionColors(userdata.modules.bgID)
          DASH.stickerAvailable = res2;
          DASH.selectSticker =
            res2.find((x) => x.id == userdata.modules.sticker) || "none";

          DASH.selectBooster =
            res.find(
              (x) =>
                x.icon ==
                (res2.find((y) => y.id == userdata.modules.sticker) || {})
                  .series_id
            ) || "none";
        })
    );
  })
);

function updateUserBGs(){
  fetch("/api/user/"+userinfo.id+"/bgs").then(r =>
    r.json().then(res =>  {
      console.log({res})
      DASH.selectBackground = res.find((bg) => bg.code == userdata.modules.bgID) || "none";
      
      console.log()
      DASH.backgroundsAvailable = res.map(thisBgData=>{
        return {
          name: thisBgData.name,
          rarity: thisBgData.rarity,
          tags: thisBgData.tags,
          code: thisBgData.code,
          img: "/backdrops/" + thisBgData.code + ".png",
        };
      });
      userdata.modules.bgInventory.map((bg) => {
        let thisBgData = res.find((x) => x.code == bg) || {
          name: "Unknown",
          rarity: "C",
          tags: "unknown test",
        };
        return {
          name: thisBgData.name,
          rarity: thisBgData.rarity,
          tags: thisBgData.tags,
          code: thisBgData.code,
          img: "/backdrops/" + thisBgData.code + ".png",
        };
      }); 
      setTimeout(_=>{
        createCBGCanvas();
      },1000)
    } )
  );
}

updateUserBGs()

fetch("/api/user/"+userinfo.id+"/medals").then(r =>
  r.json().then(res => {
    DASH.medals = res;
    DASH.medalsEquipped = res.filter((m,i,a)=> userdata.modules.medals.includes(m.icon) && a.map(x=>x.icon).indexOf(m.icon)===i)
  } )
    
);



function vueDoesntFuckingWork(){
  DASH.customBgUpload = DASH.$refs.custombgHolder.files[0];
  const reader = new FileReader();
  reader.onload = async function (e) {        
    DASH.loadedBGimage = e.target.result;
    img.src = e.target.result;
  }
  reader.readAsDataURL( DASH.$refs.custombgHolder.files[0] );
}


var timer =0;
var mouse = {
  x : 0,
  y : 0,
  w : 0,
  alt : false,
  shift : false,
  ctrl : false,
  buttonLastRaw : 0, 
  buttonRaw : 0,
  over : false,
  buttons : [1, 2, 4, 6, 5, 3],  
};

function mouseMove(event) {
    
  mouse.x = event.offsetX;
  mouse.y = event.offsetY;
  if (mouse.x === undefined) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
  }
  mouse.alt = event.altKey;
  mouse.shift = event.shiftKey;
  mouse.ctrl = event.ctrlKey;
  if (event.type === "mousedown") {
      if(mouse.buttonRaw === 4){
        mouse.buttonRaw |= mouse.buttons[event.which-1];
      }else{
        event.preventDefault()
        mouse.buttonRaw |= mouse.buttons[event.which-1];
      }
  } else if (event.type === "mouseup") {
      mouse.buttonRaw &= mouse.buttons[event.which + 2];
  } else if (event.type === "mouseout") {
      mouse.buttonRaw = 0;
      mouse.over = false;
  } else if (event.type === "mouseover") {
      mouse.over = true;
  } else if (event.type === "wheel") {
      event.preventDefault()
      mouse.w = -event.deltaY;
      console.log(mouse.w)
  } else if (event.type === "DOMMouseScroll") {  
    mouse.w = -event.detail;
  }


}

function setupMouse(e) {
  e.addEventListener('mousemove', mouseMove);
  e.addEventListener('mousedown', mouseMove);
  e.addEventListener('mouseup', mouseMove);
  e.addEventListener('mouseout', mouseMove);
  e.addEventListener('mouseover', mouseMove);
  e.addEventListener('wheel', mouseMove);
  e.addEventListener('DOMMouseScroll', mouseMove); // fire fox
  
  e.addEventListener("contextmenu", function (e) {
      e.preventDefault();
  }, false);
}

function createCBGCanvas(){

  if( !DASH.userIsPremium || !DASH.backgroundsAvailable.find(x=>x.code==userdata.id)){
    return;
  }

  CANVAS =  document.getElementById("bg-canvas");
  ctx = CANVAS.getContext("2d");
  img.src = DASH.loadedBGimage;

  
  setupMouse(CANVAS);

  var displayTransform = {
    x:0,
    y:0,
    ox:0,
    oy:0,
    scale:1,
    rotate:0,
    cx:0,  // chase values Hold the actual display
    cy:0,
    cox:0,
    coy:0,
    cscale:1,
    crotate:0,
    dx:0,  // deltat values
    dy:0,
    dox:0,
    doy:0,
    dscale:1,
    drotate:0,
    drag:0.1,  // drag for movements
    accel:0.7, // acceleration
    matrix:[0,0,0,0,0,0], // main matrix
    invMatrix:[0,0,0,0,0,0], // invers matrix;
    mouseX:0,
    mouseY:0,
    ctx:ctx,
    setTransform:function(){
        var m = this.matrix;
        var i = 0;
        this.ctx.setTransform(m[i++],m[i++],m[i++],m[i++],m[i++],m[i++]);
    },
    setHome:function(){
        this.ctx.setTransform(1,0,0,1,0,0);
        
    },
    update:function(){
  
        // accel
        this.dx += (this.x-this.cx)*this.accel;
        this.dy += (this.y-this.cy)*this.accel;
        this.dox += (this.ox-this.cox)*this.accel;
        this.doy += (this.oy-this.coy)*this.accel;
        this.dscale += (this.scale-this.cscale)*this.accel;
        this.drotate += (this.rotate-this.crotate)*this.accel;
  
        // drag
        this.dx *= this.drag;
        this.dy *= this.drag;
        this.dox *= this.drag;
        this.doy *= this.drag;
        this.dscale *= this.drag;
        this.drotate *= this.drag;
  
        this.cx += this.dx;
        this.cy += this.dy;
        this.cox += this.dox;
        this.coy += this.doy;
        this.cscale += this.dscale;
        this.crotate += this.drotate;
        
        this.matrix[0] = Math.cos(this.crotate)*this.cscale;
        this.matrix[1] = Math.sin(this.crotate)*this.cscale;
        this.matrix[2] =  - this.matrix[1];
        this.matrix[3] = this.matrix[0];
  
        this.matrix[4] = -(this.cx * this.matrix[0] + this.cy * this.matrix[2])+this.cox;
        this.matrix[5] = -(this.cx * this.matrix[1] + this.cy * this.matrix[3])+this.coy;        
  
        var det = (this.matrix[0] * this.matrix[3] - this.matrix[1] * this.matrix[2]);
        this.invMatrix[0] = this.matrix[3] / det;
        this.invMatrix[1] =  - this.matrix[1] / det;
        this.invMatrix[2] =  - this.matrix[2] / det;
        this.invMatrix[3] = this.matrix[0] / det;
        
        if(mouse !== undefined){ 
            if(mouse.oldX !== undefined && (mouse.buttonRaw & 1)===1){ 
                var mdx = mouse.x-mouse.oldX; 
                var mdy = mouse.y-mouse.oldY;
                var mrx = (mdx * this.invMatrix[0] + mdy * this.invMatrix[2]);
                var mry = (mdx * this.invMatrix[1] + mdy * this.invMatrix[3]);   
                this.x -= mrx;
                this.y -= mry;
            }
            if(mouse.w !== undefined && mouse.w !== 0){
                this.ox = mouse.x;
                this.oy = mouse.y;
                this.x = this.mouseX;
                this.y = this.mouseY;
  
                if(mouse.w > 0){ // zoom in
                    this.scale *= 1.1;
                    mouse.w -= 20;
                    if(mouse.w < 0){
                        mouse.w = 0;
                    }
                }
                if(mouse.w < 0){ // zoom out
                    this.scale *= 1/1.1;
                    mouse.w += 20;
                    if(mouse.w > 0){
                        mouse.w = 0;
                    }
                }
  
            }
  
            var screenX = (mouse.x - this.cox);
            var screenY = (mouse.y - this.coy);
            this.mouseX = this.cx + (screenX * this.invMatrix[0] + screenY * this.invMatrix[2]);
            this.mouseY = this.cy + (screenX * this.invMatrix[1] + screenY * this.invMatrix[3]);            
            mouse.rx = this.mouseX; 
            mouse.ry = this.mouseY;
  
            mouse.oldX = mouse.x;
            mouse.oldY = mouse.y;
        }
        
    }
  }  

  ctx.font = "14px Panton";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
    
  function update(){
    if(!ctx) return;
    timer += 1; 
    displayTransform.update();
    displayTransform.setHome();
    ctx.clearRect(0,0,CANVAS.width,CANVAS.height);
    if(img.complete){
        displayTransform.setTransform();
        ctx.fillStyle = "#0b0b25"
        ctx.fillRect(-2000,-2000,5000,5000)
        ctx.drawImage(img,0,0);
        ctx.fillStyle = "white";

        

    }else{
        displayTransform.setTransform();
        ctx.fillText("Loading image...",100,100);
        
    }

    requestAnimationFrame(update);
  }
  
  update();
}

function isPremium(){
  return userdata && userdata.donator && !['plastic','aluminium','iron'].includes(userdata.donator)
}

function createCustomBG(){
  return {
    name: `${userdata.name}'s Custom Background`,
    rarity: "XR",
    tags: "CUSTOM",
    code:  userdata.id,
    img: "/backdrops/" + userdata.id + ".png?v="+Date.now(),
  }
}

createCBGCanvas()

