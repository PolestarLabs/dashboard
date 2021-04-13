var TIMER = null;
var DASH;

VueSelect.VueSelect.methods.maybeAdjustScroll = () => false;



var Chrome = window.VueColor.Chrome;

if (!userdata.modules.flairsInventory.includes("default"))
  userdata.modules.flairsInventory.push("default");
const flairsAvailable = userdata.modules.flairsInventory;

 DASH = new Vue({
  el: "#dash",
  data: () => {
    return {
      RSHP: {loading:true},
      featuredMarriage: userdata.featuredMarriage,
      message: "hello",
      favcolor: {
        hex: userdata.modules.favcolor,
        source: "hex",
      },
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
      medalsEquipped: [],
      hooperSettings: {
        itemsToShow: 5,
        centerMode: true,
        infiniteScroll: true,
        vertical: true,
        transition: 100,
        initialSlide: flairsAvailable.indexOf(userdata.modules.flairTop),
      },
      sortWife: "ring",
    };
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
    fuckThis() {
      $("nav.topbar ").css({ background: this.favcolor.hex });
      updateColorName(this.favcolor.hex);
      AUTOSAVE("COLOR",true)
      AUTOSAVE("TAGLINE",true)
      AUTOSAVE("PTXT",true)
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
      $("#background-bar .name.sel").html(item.name);
      $("#background-bar .bgcode code").html(item.code);
      $(".sidebg").attr("src", "/backdrops/" + item.code + ".png");
      $("#background-bar .background-slot, .user-bg").css({
        "background-image": "url('/backdrops/" + item.code + ".png')",
      });
      $("#background-bar .background-thumb").css({
        "background-image": "url('/backdrops/" + item.code + ".png')",
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
  AUTOSAVE("COLOR")
  fetch(
    "https://www.thecolorapi.com/id?hex=" + hex.replace("#", "")
  ).then((r) => r.json().then(async (res) => {
    $("#colorname").html(res.name.value)
    await   AUTOSAVE("COLOR");
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
      medals: DASH.medalsEquipped.map(x=>x.id||x.icon||0),
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
        fetch("/dashboard/profile/background", {
          method: "PATCH",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            data: userdata.modules.bgInventory.indexOf(relevantData.bkg),
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


fetch("/api/user/"+userinfo.id+"/bgs").then(r =>
  r.json().then(res =>  {
    console.log({res})
    DASH.selectBackground = res.find((bg) => bg.code == userdata.modules.bgID) || "none";
    
    DASH.backgroundsAvailable =// res;
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
  } )
);
fetch("/api/user/"+userinfo.id+"/medals").then(r =>
  r.json().then(res => {
    DASH.medals = res;
    DASH.medalsEquipped = res.filter((m,i,a)=> userdata.modules.medals.includes(m.icon) && a.map(x=>x.icon).indexOf(m.icon)===i)
  } )
    
);

